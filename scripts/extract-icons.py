import re
import os

BASE = "01- Creative Assets _ Fonts, Icons, Etc./Additional Icons/SVG"
OUT = "public/icons"

# El export original del brand kit tiene los nombres de archivo desalineados
# de su forma real (cada carpeta de "nombre de icono" mezcla 2 formas
# distintas entre sus 7 variantes de color). Se verificó visualmente cada
# una de las 11 formas únicas del set y se mapeó al archivo correcto abajo.
# Ver icon-debug (borrado tras la verificación) para el proceso.
ICONS = {
    "bolt": "AWS Student Builder Group_RGB_Icons_Bolt_Blue.svg",
    "bracket-smile-double": "AWS Student Builder Group_RGB_Icons_Double Bracket Smile_Blue.svg",
    "bracket-smile": "AWS Student Builder Group_RGB_Icons_Single Bracket Smile_Blue.svg",
    "key": "AWS Student Builder Group_RGB_Icons_Key_Blue.svg",
    "clock": "AWS Student Builder Group_RGB_Icons_Clock_Magenta.svg",
    "drop": "AWS Student Builder Group_RGB_Icons_Drop_Magenta.svg",
    "ladder": "AWS Student Builder Group_RGB_Icons_Ladder_Mint.svg",
    "speaker": "AWS Student Builder Group_RGB_Icons_Speaker_Amber.svg",
    "teams": "AWS Student Builder Group_RGB_Icons_Teams_Magenta.svg",
    "trophy": "AWS Student Builder Group_RGB_Icons_Trophy_Amber.svg",
    "wrench": "AWS Student Builder Group_RGB_Icons_Wrench_Mint.svg",
}

os.makedirs(OUT, exist_ok=True)

for name, filename in ICONS.items():
    path = os.path.join(BASE, filename)
    content = open(path, encoding="utf-8").read()
    vb = re.search(r'viewBox="([^"]+)"', content).group(1)
    d = re.search(r'<path d="([^"]+)"', content).group(1)
    out = (
        f'<svg viewBox="{vb}" fill="none" xmlns="http://www.w3.org/2000/svg">\n'
        f'<path d="{d}" fill="currentColor"/>\n'
        f"</svg>\n"
    )
    dst = os.path.join(OUT, f"{name}.svg")
    with open(dst, "w", encoding="utf-8") as f:
        f.write(out)
    print(f"{dst}: viewBox={vb}")
