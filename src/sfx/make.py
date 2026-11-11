"""Converte os 50 SFX do Artlist em mp3 curtos e nivelados para BunkerDosMortos/audio/sfx.
Uso: python3 make.py <pasta dos .aac> <pasta de saída>"""
import subprocess, sys, os, glob, numpy as np

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

def find(key):
    m = [f for f in glob.glob(os.path.join(SRC, '*.aac')) if key.lower() in os.path.basename(f).lower()]
    assert len(m) == 1, (key, m)
    return m[0]

def decode(f):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', '44100', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()

def encode(x, name, fade=0.06, peak=0.89):
    x = x.astype(np.float32)
    n = int(fade * 44100)
    if len(x) > n * 2 and n > 0:
        x[-n:] *= np.linspace(1, 0, n, dtype=np.float32)
        x[:64] *= np.linspace(0, 1, 64, dtype=np.float32)
    m = np.max(np.abs(x)) or 1
    x = x / m * peak
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', '44100', '-ac', '1', '-i', '-', '-b:a', '128k', os.path.join(OUT, name + '.mp3')],
                   input=x.tobytes(), check=True)
    return len(x) / 44100

def trim_start(x, thr=0.02):
    i = np.argmax(np.abs(x) > thr * np.max(np.abs(x)))
    return x[max(0, i - 220):]

def env(x, win=441):
    k = np.ones(win) / win
    return np.convolve(np.abs(x), k, mode='same')

def onsets(x, min_gap=0.18, rel=0.25):
    e = env(x)
    thr = rel * np.max(e)
    on, last = [], -1e9
    for i in range(1, len(e)):
        if e[i] > thr and e[i - 1] <= thr and (i - last) / 44100 > min_gap:
            on.append(i); last = i
    return on

def clip(key, name, maxdur, start=0.0, fade=0.06, peak=0.89):
    x = trim_start(decode(find(key))[int(start * 44100):])
    return encode(x[:int(maxdur * 44100)], name, fade, peak)

def split(key, prefix, count, seglen, rel=0.25, gap=0.18, peak=0.8):
    x = decode(find(key)); on = onsets(x, gap, rel)
    # escolhe os passos com energia parecida, espalhados pela gravação
    pick = on[1:-1] if len(on) > count + 2 else on
    step = max(1, len(pick) // count)
    out = []
    for k, i in enumerate(pick[::step][:count]):
        s = max(0, i - 600)
        out.append(encode(x[s:s + int(seglen * 44100)], f'{prefix}{k + 1}', 0.05, peak))
    return out

R = {}
# zumbis
R['z_death'] = clip('Death Calls for Me', 'z_death', 2.6)
R['z_groan_big'] = clip('Giant Unpleased Groan', 'z_groan_big', 1.5)
R['z_groan_long'] = clip('Monster Groan Long', 'z_groan_long', 3.2)
R['z_scream'] = clip('Zombie Scream Attack', 'z_scream', 2.2)
R['z_attack'] = clip('Bloated Zombie Attack', 'z_attack', 1.4)
x = decode(find('Male Snarling Gasping')); on = onsets(x, 1.2, 0.3)
for k, i in enumerate(on[:3]):
    R[f'z_snarl{k+1}'] = encode(x[max(0, i - 800):i + int(1.6 * 44100)], f'z_snarl{k+1}', 0.15)
# faca
R['knife_stab1'] = clip('Knife Stab Splatter', 'knife_stab1', 0.8)
R['knife_stab2'] = clip('Blade Stab Flesh Wound', 'knife_stab2', 0.75)
R['knife_stab3'] = clip('Deep Stab Knife', 'knife_stab3', 1.4)
R['knife_twist'] = clip('Twisting Knife', 'knife_twist', 2.6)
R['knife_swing'] = clip('Sharp Knife Swing', 'knife_swing', 0.6)
R['knife_whoosh'] = clip('Swiping Fast Double', 'knife_whoosh', 0.8)
# passos (cada passo separado)
R['step_walk'] = split('Steady Footsteps Concrete', 'step_walk', 5, 0.32, 0.3, 0.3, 0.7)
R['step_run'] = split('Running Boots', 'step_run', 5, 0.26, 0.3, 0.18, 0.75)
R['jump_land'] = clip('Jumping Quickly', 'jump_land', 0.6, start=0.0)
# impactos e gore
R['hit_metal'] = clip('Bullets hitting Metal', 'hit_metal', 0.7)
R['hit_flesh1'] = clip('Bullet Impact Piercing Flesh', 'hit_flesh1', 0.6)
R['hit_flesh2'] = clip('Bullet Impact Flesh Hit', 'hit_flesh2', 0.6)
R['hit_punch'] = clip('Bloody Punch', 'hit_punch', 0.8)
R['gore_guts'] = clip('Guts Spilling', 'gore_guts', 1.1)
R['gore_splat'] = clip('Slushy Spatter', 'gore_splat', 1.05)
# explosões
R['expl_sharp'] = clip('Sharp Explosion Close', 'expl_sharp', 1.4, fade=0.3)
R['expl_big'] = clip('Powerful Explosion Close', 'expl_big', 3.4, fade=0.8)
# tiros
R['gun_pistol'] = clip('SIG P229', 'gun_pistol', 0.9, fade=0.25)
R['gun_shotgun'] = clip('Solid Slug', 'gun_shotgun', 1.2, fade=0.3)
R['gun_sniper'] = clip('Sako TRG', 'gun_sniper', 1.4, fade=0.4)
R['gun_smg'] = clip('FN P90', 'gun_smg', 0.38, fade=0.15)
R['gun_revolver'] = clip('Revolver Gunshot', 'gun_revolver', 1.3, fade=0.4)
R['gun_ar'] = clip('Ak47 Single Shot', 'gun_ar', 0.45, fade=0.18)
R['gun_lmg'] = clip('Enfield Rifle Firing', 'gun_lmg', 0.5, fade=0.2)
R['gun_barrett'] = clip('Barrett M98B', 'gun_barrett', 1.2, fade=0.4)
R['gun_rifle'] = clip('Mosin Nagant Rifle', 'gun_rifle', 1.4, fade=0.4)
# recarga e mecânica
R['rl_mag_out'] = clip('Pulling Magazine', 'rl_mag_out', 0.77)
R['rl_mag_in'] = clip('Inserting Magazine', 'rl_mag_in', 1.0)
R['rl_arm'] = clip('M16 Loading Magazine', 'rl_arm', 0.32, fade=0.03)
R['rl_shotgun'] = clip('Shotgun Racking', 'rl_shotgun', 0.98)
R['rl_slide'] = clip('Browning HP35', 'rl_slide', 0.96)
R['rl_lever'] = clip('AK47 Cocking', 'rl_lever', 1.3)
R['dry_fire'] = clip('VP70 Dry Firing', 'dry_fire', 0.8)
R['shell_drop'] = clip('Bullet Shell Drop', 'shell_drop', 0.83, peak=0.5)
# caixa, loja, menu
R['box_open'] = clip('Treasure Chest With Gold', 'box_open', 2.4, fade=0.4)
R['levelup'] = clip('Level Up Bright Chimes', 'levelup', 2.2, fade=0.4)
R['powerup_win'] = clip('Power Up Magic Bowl', 'powerup_win', 2.5, fade=0.5)
R['cash'] = clip('Cash Register', 'cash', 1.8, fade=0.3)
# mundo
R['hammer'] = clip('Hammering Nails', 'hammer', 1.6)
R['wood_break'] = clip('Breaking Wood Plank', 'wood_break', 1.35)
R['door_metal'] = clip('Heavy Metal Door', 'door_metal', 4.0, fade=0.5)
R['drink_open'] = clip('Open Beer Bottle', 'drink_open', 0.56, fade=0.08)
R['generator'] = clip('Generator Activated', 'generator', 4.5, fade=1.0)
R['scare'] = clip('Horror Stringer', 'scare', 4.8, fade=0.8)
for k, v in R.items():
    print(k, v if not isinstance(v, float) else round(v, 2))
