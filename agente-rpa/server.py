import pyautogui
import time
import json
import urllib.request
import urllib.error

# Configurações do Supabase (Mesmas do Vue.js)
SUPABASE_URL = 'https://hrwlxnojrhkdfrobxzib.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhyd2x4bm9qcmhrZGZyb2J4emliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MDkwMjMsImV4cCI6MjA5Nzk4NTAyM30.J6afMAfad0qMsd1Hds0hZ-oVcaduYvUuMR1lbyjKzZM'

# Trava de segurança (jogue o mouse para o canto da tela para abortar)
pyautogui.FAILSAFE = True

def format_date(date_string):
    if not date_string: return ""
    partes = date_string.split("-")
    if len(partes) == 3:
        return f"{partes[2]}{partes[1]}{partes[0]}" # DDMMYYYY
    return date_string.replace("-", "")

def fetch_pendentes():
    # Busca reservas com status = 'pendente'
    url = f"{SUPABASE_URL}/rest/v1/reservas?status=eq.pendente&select=*"
    req = urllib.request.Request(url, headers={
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    })
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data
    except Exception as e:
        print(f"Erro ao buscar no Supabase: {e}")
        return []

def marcar_como_processado(id_reserva):
    url = f"{SUPABASE_URL}/rest/v1/reservas?id=eq.{id_reserva}"
    payload = json.dumps({"status": "processado"}).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }, method='PATCH')
    try:
        urllib.request.urlopen(req)
        print(f"[{id_reserva}] Marcado como processado!")
    except Exception as e:
        print(f"Erro ao atualizar status: {e}")

def processar_reserva(reserva):
    titulo = reserva.get("disciplina", "")
    data = format_date(reserva.get("data", ""))
    hora_inicio = reserva.get("horaInicio", "")
    hora_fim = reserva.get("horaFim", "")
    obs = reserva.get("observacao", "")
    recurso = reserva.get("recurso", "")
    
    print(f"\n--- Iniciando Automação para: {titulo} ---")
    print("Você tem 3 segundos para colocar o Delphi em primeiro plano...")
    time.sleep(3)
    
    try:
        # Exemplo de Automação (Ajuste os TABs conforme seu sistema)
        # pyautogui.press('insert')
        # time.sleep(0.5)
        
        pyautogui.write(data)
        pyautogui.press('tab')
        
        pyautogui.write(data)
        pyautogui.press('tab')
        
        pyautogui.write(hora_inicio)
        pyautogui.press('tab')
        
        pyautogui.write(hora_fim)
        pyautogui.press('tab')
        
        pyautogui.write(f"Sala: {recurso} | {titulo} - {obs}")
        pyautogui.press('tab')
        
        # pyautogui.press('enter') # Salvar
        
        # Só marca como processado se a automação terminar sem erro
        marcar_como_processado(reserva.get("id"))
        
    except pyautogui.FailSafeException:
        print("Automação cancelada pelo usuário (Failsafe)")
        raise
    except Exception as e:
        print(f"Erro durante automação: {e}")

print("=== Agente RPA Inicializado ===")
print("Este agente irá verificar novos agendamentos a cada 10 segundos...")
print("Pressione Ctrl+C para encerrar.\n")

while True:
    pendentes = fetch_pendentes()
    if pendentes:
        print(f"Foram encontrados {len(pendentes)} novos agendamentos pendentes!")
        for reserva in pendentes:
            processar_reserva(reserva)
            time.sleep(1) # Pausa curta entre registros
    else:
        # Print opcional, comentamos para não poluir a tela
        # print("Nenhum agendamento pendente...")
        pass
    
    # Aguarda 10 segundos antes de verificar novamente
    time.sleep(10)
