buffer_temp = []

buffer_hum = []

N = 5

# =========================
# FILTRO PROMEDIO
# =========================

def filtro_promedio(buffer, valor):

    buffer.append(valor)

    if len(buffer) > N:

        buffer.pop(0)

    return sum(buffer) / len(buffer)