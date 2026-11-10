P=[("""function padGet(){ let gps=[]; try{ gps=navigator.getGamepads?navigator.getGamepads():[]; }catch(e){ return null; }""",
"""function padGet(){ if(PAD.hidBT&&PAD.hid&&PAD.hidPad&&performance.now()-PAD.hidPad.timestamp<700) return PAD.hidPad;   // v9: DualSense por Bluetooth com gatilhos ligados
  let gps=[]; try{ gps=navigator.getGamepads?navigator.getGamepads():[]; }catch(e){ return null; }"""),
("""    if(PAD.hidBT){ try{ await d.receiveFeatureReport(0x05); }catch(e){} }""",
"""    if(PAD.hidBT){ if(!d._v9in){ d._v9in=true; d.addEventListener('inputreport',padHidInput); } try{ await d.receiveFeatureReport(0x05); }catch(e){} }"""),
("""const CRC_T=(()=>{""",
"""/* v9: no Bluetooth, ligar os gatilhos/luz põe o DualSense no modo "completo" (relatório 0x31). Nesse modo o Windows/Chrome
   não consegue mais ler os botões pela Gamepad API e o controle "para". Então lemos os botões e analógicos direto do relatório
   HID e montamos um controle no formato padrão para o resto do jogo. */
const HIDPAD_HAT=[[1,0,0,0],[1,0,0,1],[0,0,0,1],[0,1,0,1],[0,1,0,0],[0,1,1,0],[0,0,1,0],[1,0,1,0],[0,0,0,0]];   // cima, baixo, esq, dir
function padHidInput(e){ if(e.reportId!==0x31&&e.reportId!==0x01) return; const v=e.data; if(!v||v.byteLength<11) return;
  const o=e.reportId===0x31?1:0; if(e.reportId===0x01&&v.byteLength<11) return;
  const ax=i=>{ const x=(v.getUint8(o+i)-128)/127.5; return Math.abs(x)<0.02?0:Math.max(-1,Math.min(1,x)); };
  const l2=v.getUint8(o+4)/255, r2=v.getUint8(o+5)/255, b0=v.getUint8(o+7), b1=v.getUint8(o+8), b2=v.byteLength>o+9?v.getUint8(o+9):0;
  const hat=HIDPAD_HAT[b0&0x0f]||HIDPAD_HAT[8];
  const pr=[b0&0x20,b0&0x40,b0&0x10,b0&0x80,b1&0x01,b1&0x02,null,null,b1&0x10,b1&0x20,b1&0x40,b1&0x80,hat[0],hat[1],hat[2],hat[3],b2&0x01,b2&0x02];
  let g=PAD.hidPad; if(!g){ g=PAD.hidPad={id:'DualSense Wireless Controller (Bluetooth · HID) Vendor: 054c',index:-2,connected:true,mapping:'standard',timestamp:0,axes:[0,0,0,0],buttons:pr.map(()=>({pressed:false,touched:false,value:0})),vibrationActuator:null}; }
  for(let i=0;i<pr.length;i++){ const b=g.buttons[i]; const val=i===6?l2:i===7?r2:(pr[i]?1:0); b.value=val; b.pressed=i===6?(l2>0.12||!!(b1&0x04)):i===7?(r2>0.12||!!(b1&0x08)):!!pr[i]; b.touched=b.pressed; }
  g.axes[0]=ax(0); g.axes[1]=ax(1); g.axes[2]=ax(2); g.axes[3]=ax(3); g.timestamp=performance.now();
  if(!PAD.hidSeen){ PAD.hidSeen=true; try{ padStatus(); }catch(err){} } }
const CRC_T=(()=>{""")]
