#!/bin/bash

# Script de instalação para Ubuntu VPS
# Execute com: chmod +x install.sh && ./install.sh

echo "🚀 Instalando Crypto NFT Backend no Ubuntu..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está rodando como root
if [ "$EUID" -eq 0 ]; then
    print_warning "Executando como root. Recomendado executar como usuário normal."
fi

# Atualizar sistema
print_status "Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar Node.js v18.20.8
print_status "Instalando Node.js v18.20.8..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação do Node.js
NODE_VERSION=$(node --version)
print_status "Node.js instalado: $NODE_VERSION"

# Instalar PM2 globalmente
print_status "Instalando PM2 para gerenciamento de processos..."
sudo npm install -g pm2

# Instalar dependências do projeto
print_status "Instalando dependências do projeto..."
npm install

# Configurar firewall
print_status "Configurando firewall para porta 3000..."
sudo ufw allow 3000
sudo ufw --force enable

# Criar diretório de logs
print_status "Criando diretório de logs..."
mkdir -p logs

# Testar se o servidor inicia
print_status "Testando inicialização do servidor..."
timeout 10s npm start &
SERVER_PID=$!
sleep 3

if ps -p $SERVER_PID > /dev/null; then
    print_status "✅ Servidor iniciou com sucesso!"
    kill $SERVER_PID 2>/dev/null
else
    print_error "❌ Falha ao iniciar servidor. Verifique os logs."
    exit 1
fi

# Configurar PM2
print_status "Configurando PM2..."
pm2 start server.js --name "crypto-nft-api"
pm2 startup
pm2 save

# Mostrar status
print_status "Status do PM2:"
pm2 status

# Mostrar informações de acesso
print_status "🎉 Instalação concluída!"
echo ""
echo "📋 Informações importantes:"
echo "   • Servidor rodando na porta 3000"
echo "   • Acesse: http://$(curl -s ifconfig.me):3000"
echo "   • Comandos úteis:"
echo "     - pm2 status          # Ver status"
echo "     - pm2 logs            # Ver logs"
echo "     - pm2 restart all     # Reiniciar"
echo "     - pm2 stop all        # Parar"
echo ""
echo "🔧 Para editar IDs válidos:"
echo "   nano ids.txt"
echo "   pm2 restart crypto-nft-api"
echo ""
echo "📖 Para mais informações, consulte o README.md"

