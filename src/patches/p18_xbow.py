P=[("""  function gunshot0(kind,up,vol,x,z){
    if(!ctx) return;""","""  function gunshot0(kind,up,vol,x,z){
    if(!ctx) return;
    if(kind==='xbow'){ let o={vol:(vol==null?1:vol)*1.1,prio:x==null,wet:0.3}; if(x!=null){ o.x=x; o.z=z; o.range=45; } if(!sample('crossbow_shot',o)){ const n=outNode(vol==null?1:vol,0,.3,null); osc(n,{type:'triangle',freq:220,freqEnd:90,dur:.18,gain:.3}); burst(n,{type:'bandpass',freq:1800,freqEnd:500,q:2,dur:.12,gain:.4}); } return; }""")]
