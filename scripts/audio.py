# /// script
# requires-python = ">=3.10,<3.14"
# dependencies = ["librosa>=0.11", "soundfile", "numpy"]
# ///
"""Análise de áudio com librosa. Dois usos:

  bun run audio <slug>
      Lê a trilha do vídeo (a narrada, se existir) e os marcos de timeline.json. Mostra a curva de energia
      entre os marcos (para comparar com a curva do roteiro) e, para cada marco, a que distância fica o ataque
      de som mais próximo. Som que chega depois da imagem é o contrário do J-cut pedido no guia.

  bun run audio --musica caminho/da/faixa.wav
      Para uma música que não foi sintetizada aqui: acha a grade de batidas (BPM por mínimos quadrados sobre
      as batidas, não o escalar do beat_track, que erra uns 2%) e sugere `bpm` e `beat` para o timeline.json.

O uv instala o librosa num ambiente próprio na primeira vez (uns minutos); nada entra no projeto.
"""
import json
import sys
from pathlib import Path

import librosa
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 22050
HOP = 256


def carregar(path: Path):
    y, sr = librosa.load(path, sr=SR, mono=True)
    return y, sr


def ataques(y, sr):
    """Tempos (s) dos ataques e a força de cada um, normalizada pela mais forte."""
    env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=HOP)
    idx = librosa.onset.onset_detect(onset_envelope=env, sr=sr, hop_length=HOP, backtrack=False, units="frames")
    t = librosa.frames_to_time(idx, sr=sr, hop_length=HOP)
    f = env[idx] / (env.max() or 1)
    return t, f


def barra(v, largura=28):
    return "█" * int(round(v * largura))


def video(slug: str):
    tl = json.loads((ROOT / "src/videos" / slug / "timeline.json").read_text())
    fps, beat = tl["fps"], tl["beat"]
    fim = sum(s["duration"] for s in tl["scenes"]) / fps
    wav = next((p for p in [ROOT / "public" / slug / "trilha-narrada.wav", ROOT / "public" / slug / "trilha.wav"] if p.exists()), None)
    if wav is None:
        sys.exit(f"Sem trilha em public/{slug}/. Rode bun run trilha {slug}.")
    y, sr = carregar(wav)
    marcos = sorted(((k, v * beat / fps) for k, v in tl["marks"].items()), key=lambda m: m[1])
    print(f"\n{wav.relative_to(ROOT)} · {len(y) / sr:.2f} s (vídeo: {fim:.2f} s) · {tl['bpm']} BPM, {beat} quadros por tempo\n")

    # Curva de energia: RMS em dB de cada trecho entre marcos, relativa ao trecho mais forte.
    rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=HOP)[0]
    tr = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=HOP)
    bordas = [0.0] + [t for _, t in marcos if 0 < t < fim] + [fim]
    nomes = ["(início)"] + [k for k, t in marcos if 0 < t < fim]
    nivel = []
    for a, c in zip(bordas, bordas[1:]):
        trecho = rms[(tr >= a) & (tr < c)]
        nivel.append(20 * np.log10(max(float(np.sqrt(np.mean(trecho**2))) if len(trecho) else 0, 1e-6)))
    topo = max(nivel)
    print("Curva de energia por trecho (dB abaixo do trecho mais forte; compare com a curva do roteiro):")
    for nome, a, c, db in zip(nomes, bordas, bordas[1:], nivel):
        rel = db - topo
        print(f"  {a:7.2f} s  {nome:<16.16} {rel:6.1f} dB  {barra(max(0.0, 1 + rel / 36))}")

    # Marco contra ataque: positivo = o som chega depois da imagem.
    # Os ataques vêm da trilha sem voz: na mix narrada, cada sílaba é um ataque e todo marco parece atrasado.
    pura = ROOT / "public" / slug / "trilha.wav"
    if pura.exists() and pura != wav:
        y, sr = carregar(pura)
        print(f"\n(marcos medidos em {pura.relative_to(ROOT)}, sem a voz)")
    t_on, f_on = ataques(y, sr)
    fortes = t_on[f_on >= 0.12]
    print("\nMarco × ataque de som mais próximo (em quadros; − = som antes da imagem, como pede o J-cut):")
    tarde, sem = [], []
    for k, t in marcos:
        if not len(fortes) or t > fim:
            continue
        alvo = fortes[np.argmin(np.abs(fortes - t))]
        q = (alvo - t) * fps
        nota = ""
        # O ataque pertence ao marco mais próximo dele; se esse marco é outro, este fica sem som.
        dono = min(marcos, key=lambda m: abs(m[1] - alvo))[0]
        if abs(q) > 6 or dono != k:
            nota = "sem som neste marco"
            sem.append(k)
        elif q > 1.5:
            nota = "SOM ATRASADO"
            tarde.append(k)
        print(f"  {t:7.2f} s  {k:<16.16} {q:+6.1f}  {nota}")
    print(f"\n{len(tarde)} marco(s) com som atrasado: {', '.join(tarde) or 'nenhum'}")
    print(f"{len(sem)} marco(s) sem som por perto (certo quando não conta a história; som em tudo vira mickey mousing).\n")


def musica(path: Path):
    y, sr = carregar(path)
    _, bt = librosa.beat.beat_track(y=y, sr=sr, hop_length=HOP, tightness=400, units="time")
    if len(bt) < 8:
        sys.exit("Menos de 8 batidas detectadas: a faixa não tem pulso claro para montar uma grade.")
    i = np.arange(len(bt))
    periodo, t0 = np.polyfit(i, bt, 1)
    res = bt - (t0 + i * periodo)
    bpm = 60 / periodo
    print(f"\n{path} · {len(y) / sr:.2f} s · {len(bt)} batidas")
    print(f"Grade: {bpm:.3f} BPM, primeira batida em {t0:.3f} s · resíduo médio {np.mean(np.abs(res)) * 1000:.1f} ms, máximo {np.max(np.abs(res)) * 1000:.1f} ms")
    if np.max(np.abs(res)) > 0.03:
        print("ATENÇÃO: resíduo acima de 30 ms. O andamento varia ou a detecção pegou metade/dobro; confira de ouvido.")
    print("Metade e dobro são candidatos legítimos; escolha pelo que se sente como pulso:")
    for nome, b in (("metade", bpm / 2), ("detectado", bpm), ("dobro", bpm * 2)):
        q = 30 * 60 / b
        print(f"  {nome:<10} {b:8.3f} BPM → beat = {q:6.2f} quadros a 30 fps{'' if abs(q - round(q)) < 0.05 else '  (não é inteiro: o corte deriva; ajuste o andamento da faixa)'}")
    rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=HOP)[0]
    blocos = np.array_split(rms, 24)
    e = np.array([float(np.sqrt(np.mean(b**2))) for b in blocos])
    e = e / (e.max() or 1)
    dur = len(y) / sr
    print("\nEnergia ao longo da faixa (24 trechos):")
    for n, v in enumerate(e):
        print(f"  {n * dur / 24:7.2f} s  {barra(float(v))}")
    print("")


if __name__ == "__main__":
    args = sys.argv[1:]
    if len(args) == 2 and args[0] == "--musica":
        musica(Path(args[1]).resolve())
    elif len(args) == 1:
        video(args[0])
    else:
        sys.exit("Uso: bun run audio <slug>   |   bun run audio --musica faixa.wav")
