P=[("""      z.g.position.y=Math.sin(k*Math.PI)*1.0+(z.hangY||0)*(1-k); z.moving=true;""",
"""      /* v9: pulo de verdade — sobe agarrando o parapeito, passa o corpo por cima e cai do outro lado dobrando os joelhos */
      const up=k<0.38?smooth(k/0.38):1, dn=k>0.62?Math.pow((k-0.62)/0.38,2):0; z.g.position.y=(0.95*up+0.12*Math.sin(Math.min(1,Math.max(0,(k-0.38)/0.24))*Math.PI))*(1-dn)+(z.hangY||0)*(1-k); z.climbK=k; z.moving=true;""")]
