// ====== Estilos por defecto ======
const DEFAULT_STYLES = [
  { name:"Blackwork", factor:0.7 },
  { name:"Realismo", factor:1.3 },
  { name:"Microrrealismo", factor:1.2 },
  { name:"Minimalismo", factor:0.7 },
  { name:"A color", factor:1.3 },
  { name:"Estilo ilustrativo", factor:0.9 },
  { name:"Tribal", factor:1.0 },
  { name:"Tribal gótico", factor:1.1 },
];

const tbody = document.getElementById('stylesBody');
const out = document.getElementById('output');

// ====== utilidades ======
function escapeHtml(str){
  return str.replace(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function getStyles(){
  const rows = [...tbody.querySelectorAll('tr')];
  const list = [];
  for(const r of rows){
    const name = r.querySelector('input[type="text"]').value.trim();
    const factor = parseFloat(r.querySelector('input[type="number"]').value);
    if(!name) continue;
    list.push({name, factor: isFinite(factor)? factor:1});
  }
  return list;
}
function styleOptionsHTML(styles){
  return styles.map(s=>'<option>'+escapeHtml(s.name)+'</option>').join('\n            ');
}
function styleObjectLiteral(styles){
  return '{ ' + styles.map(s=>'"'+s.name.replaceAll('"','\\"')+'":'+s.factor).join(', ') + ' }';
}

// ====== filas de estilo ======
function addStyleRow(name="", factor=1){
  const tr = document.createElement('tr');

  const tdName = document.createElement('td');
  const inpName = document.createElement('input');
  inpName.type = 'text'; inpName.placeholder = 'Nombre del estilo'; inpName.value = name;
  tdName.appendChild(inpName);

  const tdFactor = document.createElement('td');
  const inpFactor = document.createElement('input');
  inpFactor.type = 'number'; inpFactor.step = '0.01'; inpFactor.value = factor;
  tdFactor.appendChild(inpFactor);

  const tdActions = document.createElement('td');
  const btnDel = document.createElement('button');
  btnDel.className = 'btn'; btnDel.type = 'button'; btnDel.textContent = 'Eliminar';
  btnDel.addEventListener('click', ()=> tr.remove());
  tdActions.appendChild(btnDel);

  tr.appendChild(tdName); tr.appendChild(tdFactor); tr.appendChild(tdActions);
  tbody.appendChild(tr);
}
DEFAULT_STYLES.forEach(s=>addStyleRow(s.name, s.factor));
document.getElementById('addStyle').addEventListener('click', ()=> addStyleRow("",1));

// ====== leer configuración ======
const els = {
  title: document.getElementById('cfgTitle'),
  phone: document.getElementById('cfgPhone'),
  curS: document.getElementById('cfgCurrencySymbol'),
  curC: document.getElementById('cfgCurrencyCode'),
  base: document.getElementById('cfgBase'),
  zF: document.getElementById('cfgZoneFacil'),
  zM: document.getElementById('cfgZoneMedia'),
  zD: document.getElementById('cfgZoneDificil'),
  t1A: document.getElementById('cfgT1Area'),
  t1P: document.getElementById('cfgT1Price'),
  t2A: document.getElementById('cfgT2Area'),
  t2P: document.getElementById('cfgT2Price'),
  t3A: document.getElementById('cfgT3Area'),
  t3P: document.getElementById('cfgT3Price'),
  t4P: document.getElementById('cfgT4Price'),

  vFile: document.getElementById('cfgVideoFile'),
  vURL: document.getElementById('cfgVideoURL'),
  vEmbed: document.getElementById('cfgEmbed'),
  vOverlay: document.getElementById('cfgOverlay'),
};

function readCfgBase(){
  return {
    title: els.title.value || 'Presupuesto de Arte en Piel',
    phone: els.phone.value.replace(/\D/g,''),
    currencySymbol: els.curS.value || '$',
    currencyCode: els.curC.value || 'USD',
    base: parseFloat(els.base.value) || 0,
    zoneFacil: parseFloat(els.zF.value) || 1,
    zoneMedia: parseFloat(els.zM.value) || 1.15,
    zoneDificil: parseFloat(els.zD.value) || 1.3,
    t1Area: parseFloat(els.t1A.value) || 15,
    t1Price: parseFloat(els.t1P.value) || 25,
    t2Area: parseFloat(els.t2A.value) || 60,
    t2Price: parseFloat(els.t2P.value) || 85,
    t3Area: parseFloat(els.t3A.value) || 200,
    t3Price: parseFloat(els.t3P.value) || 145,
    t4Price: parseFloat(els.t4P.value) || 215,
    styles: getStyles(),
    video: { embed: !!els.vEmbed.checked, url: (els.vURL.value || '').trim(), overlay: Math.max(0, Math.min(0.9, parseFloat(els.vOverlay.value) || 0)) }
  };
}

// Lee el archivo de video (si corresponde) y devuelve cfg completo
async function readCfg(){
  const cfg = readCfgBase();
  if (cfg.video.embed) {
    const f = els.vFile.files[0];
    if (!f) { alert('Selecciona un video para incrustar o desmarca la opción.'); throw new Error('Sin video'); }
    if (f.size > 10 * 1024 * 1024) { alert('El video supera 10 MB. Reduce el tamaño o desactiva “Incrustar en HTML”.'); throw new Error('Video grande'); }
    cfg.video.dataUrl = await fileToDataURL(f);
  } else {
    if (!cfg.video.url) {
      // no incrusta: requiere URL
      alert('Ingresa la URL RAW del video en GitHub o activa “Incrustar en HTML”.');
      throw new Error('Sin URL');
    }
  }
  return cfg;
}

function fileToDataURL(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ====== plantilla HTML final (concat para evitar backticks dentro) ======
function buildFinalHTML(cfg){
  const optionsHTML = styleOptionsHTML(cfg.styles);
  const styleObj = styleObjectLiteral(cfg.styles);
  const videoSrc = cfg.video.embed ? cfg.video.dataUrl : cfg.video.url;
  const overlay = cfg.video.overlay;

  return '<!DOCTYPE html>\n'
+ '<html lang="es">\n'
+ '<head>\n'
+ '<meta charset="utf-8"/>\n'
+ '<meta name="viewport" content="width=device-width, initial-scale=1"/>\n'
+ '<title>' + escapeHtml(cfg.title) + '</title>\n'
+ '<link rel="preconnect" href="https://fonts.googleapis.com"/>\n'
+ '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">\n'
+ '<style>\n'
+ ':root{--bg:#0B0F14;--surface:#11161D;--text:#F6F8FA;--text-dim:#7E8793;--muted:#BFC6CF;--line:#FFFFFF1F;--accent:#3F6076;--accent-deep:#0E2A3A;--glow:#E7F1FF;--r:18px;--shadow:0 20px 60px rgba(0,0,0,.45)}\n'
+ '*{box-sizing:border-box}\n'
+ 'body{margin:0;color:#F6F8FA;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:radial-gradient(1200px 800px at 70% 10%,#11161D 0%,#0B0F14 55%)}\n'
+ '.bg-video{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2}\n'
+ '.bg-overlay{position:fixed;inset:0;background:rgba(0,0,0,'+overlay+');z-index:-1;pointer-events:none}\n'
+ '.wrapper{max-width:1080px;margin:40px auto;padding:24px}\n'
+ 'h1{font-family:"Space Grotesk",Inter,sans-serif;font-weight:700;letter-spacing:.3px;margin:0 0 12px}\n'
+ '.sub{color:#7E8793;margin-bottom:28px}\n'
+ '.panel{background:color-mix(in oklab,#11161D 85%,white 15%);border:1px solid #FFFFFF1F;border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.45);backdrop-filter:blur(14px);padding:22px;margin-bottom:18px}\n'
+ '.grid{display:grid;gap:16px}\n'
+ '@media(min-width:900px){.grid{grid-template-columns:1.2fr 1fr}}\n'
+ 'label{display:block;font-size:.92rem;color:#BFC6CF;margin-bottom:8px}\n'
+ 'select,input{width:100%;padding:12px 14px;border-radius:12px;background:#0E1218;color:#F6F8FA;border:1px solid #FFFFFF1F;outline:none}\n'
+ 'input[type="number"]{appearance:textfield}\n'
+ '.row{display:grid;grid-template-columns:1fr 1fr;gap:12px}\n'
+ '.help{font-size:.85rem;color:#7E8793;margin-top:6px}\n'
+ '.btn{padding:12px 16px;border:1px solid #FFFFFF1F;border-radius:999px;background:transparent;color:#F6F8FA;cursor:pointer;transition:.25s}\n'
+ '.btn:hover{border-color:#dfe9ff55;box-shadow:0 0 0 6px #dfe9ff22,0 8px 28px rgba(0,0,0,.4)}\n'
+ '.file{display:flex;align-items:center;gap:12px}\n'
+ '.file input{padding:10px;background:#0E1218}\n'
+ '.summary h2{margin:0 0 10px;font-family:"Space Grotesk";letter-spacing:.3px}\n'
+ '.price{font-family:"Space Grotesk",Inter,sans-serif;font-size:46px;font-weight:700;background:linear-gradient(180deg,#E7F1FF,#BFC6CF);-webkit-background-clip:text;color:transparent}\n'
+ '.table{width:100%;border-collapse:collapse;margin-top:10px}\n'
+ '.table td{padding:8px 0;border-bottom:1px solid #FFFFFF1F;color:#BFC6CF}\n'
+ '.table td:first-child{color:#F6F8FA}\n'
+ '.badge{font:600 .78rem/1 "Space Grotesk";color:#BFC6CF;background:#0E1218;border:1px solid #FFFFFF1F;padding:6px 10px;border-radius:999px}\n'
+ '.footer{display:flex;gap:12px;flex-wrap:wrap;margin-top:16px;align-items:center}\n'
+ '.note{color:#7E8793;font-size:.86rem}\n'
+ '.btn-whatsapp{background:#25D366;color:#0b0f14;border:none;font-weight:700}\n'
+ '.btn-whatsapp:hover{box-shadow:0 0 0 6px #25d36633,0 8px 28px rgba(0,0,0,.4)}\n'
+ '@media (max-width:600px){.wrapper{padding:16px;margin:24px auto}h1{font-size:1.6rem}.sub{font-size:.95rem}.panel{padding:16px}.row{grid-template-columns:1fr;gap:10px}.price{font-size:36px}.footer{flex-direction:column;align-items:stretch;gap:10px}.btn,.btn-whatsapp{width:100%}}\n'
+ 'input,select{font-size:16px}#filename{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n'
+ '</style>\n'
+ '</head>\n'
+ '<body>\n'
+ '<video class="bg-video" autoplay muted loop playsinline preload="auto" src="'+videoSrc+'"></video>\n'
+ '<div class="bg-overlay"></div>\n'
+ '<div class="wrapper">\n'
+ '  <h1>' + escapeHtml(cfg.title) + '</h1>\n'
+ '  <div class="sub">Selecciona zona, estilo y tamaño. El precio se actualiza en tiempo real.</div>\n'
+ '  <div class="grid">\n'
+ '    <div class="panel">\n'
+ '      <div class="row">\n'
+ '        <div>\n'
+ '          <label>Hemilado del cuerpo</label>\n'
+ '          <select id="side">\n'
+ '            <option value="derecho">Derecho</option>\n'
+ '            <option value="izquierdo">Izquierdo</option>\n'
+ '            <option value="central">Central</option>\n'
+ '          </select>\n'
+ '        </div>\n'
+ '        <div>\n'
+ '          <label>Región</label>\n'
+ '          <select id="region">\n'
+ '            <option value="cabeza_cuello">Cabeza / Cuello</option>\n'
+ '            <option value="brazo">Brazo</option>\n'
+ '            <option value="torso">Torso</option>\n'
+ '            <option value="pierna">Pierna</option>\n'
+ '            <option value="otros">Otros</option>\n'
+ '          </select>\n'
+ '        </div>\n'
+ '      </div>\n'
+ '      <div>\n'
+ '        <label>Parte específica</label>\n'
+ '        <select id="part"></select>\n'
+ '        <div class="help">Ej.: Antebrazo interno, costillas externas, gemelo, etc.</div>\n'
+ '      </div>\n'
+ '      <div class="row">\n'
+ '        <div>\n'
+ '          <label>Estilo</label>\n'
+ '          <select id="style">\n'
+ '            ' + optionsHTML + '\n'
+ '          </select>\n'
+ '        </div>\n'
+ '        <div>\n'
+ '          <label>Dimensiones (cm)</label>\n'
+ '          <div class="row">\n'
+ '            <input id="w" type="number" min="1" placeholder="Ancho">\n'
+ '            <input id="h" type="number" min="1" placeholder="Alto">\n'
+ '          </div>\n'
+ '        </div>\n'
+ '      </div>\n'
+ '      <div>\n'
+ '        <label>Subir referencia (imagen)</label>\n'
+ '        <div class="file">\n'
+ '          <input id="file" type="file" accept="image/*">\n'
+ '          <span class="badge" id="filename">Sin archivo</span>\n'
+ '        </div>\n'
+ '        <div class="help">PNG/JPG. Máx. 10 MB.</div>\n'
+ '      </div>\n'
+ '    </div>\n'
+ '    <div class="panel summary">\n'
+ '      <h2>Estimado</h2>\n'
+ '      <div class="price" id="price">' + cfg.currencySymbol + '0</div>\n'
+ '      <table class="table">\n'
+ '        <tr><td>Área</td><td id="area">0 cm²</td></tr>\n'
+ '        <tr><td>Zona (multiplicador)</td><td id="zoneMult">–</td></tr>\n'
+ '        <tr><td>Estilo (multiplicador)</td><td id="styleMult">–</td></tr>\n'
+ '        <tr><td>Base por cm²</td><td id="base">' + cfg.currencySymbol + (Number(cfg.base)).toFixed(2) + '</td></tr>\n'
+ '        <tr><td>Mínimo aplicado</td><td id="min">' + cfg.currencySymbol + '0</td></tr>\n'
+ '      </table>\n'
+ '      <div class="footer">\n'
+ '        <button class="btn" id="reset">Reiniciar</button>\n'
+ '        <button class="btn btn-whatsapp" id="sendWA">Enviar por WhatsApp</button>\n'
+ '        <span class="note">* WhatsApp no permite adjuntar automáticamente archivos desde la web. Envía la imagen al abrir el chat.</span>\n'
+ '      </div>\n'
+ '    </div>\n'
+ '  </div>\n'
+ '</div>\n'
+ '<script>\n'
+ 'var CURRENCY_SYMBOL='+JSON.stringify(cfg.currencySymbol)+';\n'
+ 'var CURRENCY_CODE='+JSON.stringify(cfg.currencyCode)+';\n'
+ 'var PHONE_NUMBER='+JSON.stringify(cfg.phone)+';\n'
+ 'var BASE_PER_CM2='+Number(cfg.base)+';\n'
+ 'var STYLE_MULT='+styleObj+';\n'
+ 'var ZONE_MULT={facil:'+Number(cfg.zoneFacil)+',media:'+Number(cfg.zoneMedia)+',dificil:'+Number(cfg.zoneDificil)+'};\n'
+ 'var THRESHOLDS={t1Area:'+Number(cfg.t1Area)+',t1Price:'+Number(cfg.t1Price)+',t2Area:'+Number(cfg.t2Area)+',t2Price:'+Number(cfg.t2Price)+',t3Area:'+Number(cfg.t3Area)+',t3Price:'+Number(cfg.t3Price)+',t4Price:'+Number(cfg.t4Price)+'};\n'
+ 'var PARTS={cabeza_cuello:{mult:"dificil",items:["Cara - mejilla","Cara - sien","Oreja externa","Oreja interna","Nuca","Garganta"]},brazo:{mult:"media",items:["Hombro externo","Bíceps","Tríceps","Antebrazo externo","Antebrazo interno","Codo","Muñeca","Mano - dorso","Mano - palma","Dedos"]},torso:{mult:"media",items:["Pecho derecho","Pecho izquierdo","Esternón","Abdomen alto","Abdomen bajo","Costillas externas","Costillas internas","Ombligo / perímetro","Espalda alta","Espalda media","Espalda baja"]},pierna:{mult:"facil",items:["Muslo frontal","Muslo posterior","Rodilla","Gemelo / pantorrilla","Tibia (frontal)","Tobillo","Pie - empeine","Pie - planta","Dedos del pie"]},otros:{mult:"dificil",items:["Axila","Clavícula","Cadera / lateral","Glúteo","Cuello lateral"]}};\n'
+ 'function sizeMinimum(a){if(a<=THRESHOLDS.t1Area)return THRESHOLDS.t1Price; if(a<=THRESHOLDS.t2Area)return THRESHOLDS.t2Price; if(a<=THRESHOLDS.t3Area)return THRESHOLDS.t3Price; return THRESHOLDS.t4Price}\n'
+ 'var region=document.getElementById("region"),part=document.getElementById("part"),style=document.getElementById("style"),w=document.getElementById("w"),h=document.getElementById("h"),file=document.getElementById("file"),side=document.getElementById("side");\n'
+ 'var lastArea=0,lastPrice=0;\n'
+ 'function populateParts(){var conf=PARTS[region.value]; part.innerHTML=""; conf.items.forEach(function(i){var opt=document.createElement("option"); opt.textContent=i; opt.value=i; part.appendChild(opt)}); calc()}\n'
+ 'region.addEventListener("change",populateParts); [w,h,style,part,side].forEach(function(el){el.addEventListener("input",calc)});\n'
+ 'file.addEventListener("change",function(){document.getElementById("filename").textContent=(file.files[0]?file.files[0].name:"Sin archivo")});\n'
+ 'document.getElementById("reset").addEventListener("click",function(){w.value="";h.value="";style.selectedIndex=0;region.selectedIndex=0;side.selectedIndex=0;populateParts();document.getElementById("filename").textContent="Sin archivo"});\n'
+ 'function calc(){var width=parseFloat(w.value)||0; var height=parseFloat(h.value)||0; var area=+(width*height).toFixed(1); var zoneM=ZONE_MULT[PARTS[region.value].mult]; var styleM=STYLE_MULT[style.value]; var raw=area*BASE_PER_CM2*zoneM*styleM; var min=sizeMinimum(area); var price=Math.max(raw,min); document.getElementById("area").textContent=area+" cm²"; document.getElementById("zoneMult").textContent=region.options[region.selectedIndex].text+" ("+zoneM+"×)"; document.getElementById("styleMult").textContent=style.value+" ("+styleM+"×)"; document.getElementById("base").textContent=CURRENCY_SYMBOL+BASE_PER_CM2.toFixed(2); document.getElementById("min").textContent=area? (CURRENCY_SYMBOL+min.toFixed(0)) : (CURRENCY_SYMBOL+"0"); document.getElementById("price").textContent= (isFinite(price)? CURRENCY_SYMBOL+price.toFixed(0) : CURRENCY_SYMBOL+"0"); lastArea=area; lastPrice=isFinite(price)? Math.round(price):0 }\n'
+ 'populateParts();\n'
+ 'function buildMessage(){var regionText=region.options[region.selectedIndex].text; var lines=[]; lines.push("Hola 👋 quiero cotizar este tatuaje:"); lines.push(""); lines.push("• Lado: "+side.value); lines.push("• Región: "+regionText); lines.push("• Parte específica: "+part.value); lines.push("• Estilo: "+style.value); lines.push("• Tamaño: "+(w.value||0)+" cm (ancho) × "+(h.value||0)+" cm (alto)"); lines.push("• Área: "+lastArea+" cm²"); lines.push(""); lines.push("💵 Estimado: "+CURRENCY_SYMBOL+lastPrice+" "+CURRENCY_CODE+" (orientativo)"); lines.push("📎 Referencia: "+(file.files[0]?file.files[0].name:"sin archivo adjunto")); lines.push(""); lines.push("¿Me confirmas disponibilidad y proceso? Gracias."); return encodeURIComponent(lines.join("\\n")) }\n'
+ 'document.getElementById("sendWA").addEventListener("click",function(){ var url="https://wa.me/"+PHONE_NUMBER+"?text="+buildMessage(); var f=file.files[0]; if(f && navigator.canShare && navigator.canShare({files:[f]})){ navigator.share({files:[f], text: decodeURIComponent(buildMessage())}).catch(function(){ window.open(url,"_blank") }); } else { window.open(url,"_blank") } });\n'
+ '</script>\n'
+ '</body>\n'
+ '</html>\n';
}

// ====== Acciones ======
document.getElementById('btnGenerate').addEventListener('click', async ()=>{
  try{
    const cfg = await readCfg();
    out.value = buildFinalHTML(cfg);
    alert('¡Código generado! Ahora puedes previsualizar, copiar o descargar.');
  }catch(e){ /* errores ya mostrados */ }
});
document.getElementById('btnPreview').addEventListener('click', ()=>{
  const txt = out.value.trim(); if(!txt){ alert('Primero genera el HTML.'); return; }
  const w = window.open('', '_blank'); w.document.open(); w.document.write(txt); w.document.close();
});
document.getElementById('btnCopy').addEventListener('click', async ()=>{
  const txt = out.value.trim(); if(!txt){ alert('Primero genera el HTML.'); return; }
  await navigator.clipboard.writeText(txt); alert('Código copiado al portapapeles.');
});
document.getElementById('btnDownload').addEventListener('click', ()=>{
  const txt = out.value.trim(); if(!txt){ alert('Primero genera el HTML.'); return; }
  const blob = new Blob([txt], {type:'text/html;charset=utf-8'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'tatuaje_presupuesto.html';
  document.body.appendChild(a); a.click(); URL.revokeObjectURL(a.href); a.remove();
});
