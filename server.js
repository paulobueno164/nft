const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta nft
app.use('/nft', express.static(path.join(__dirname, 'nft')));

// Caminho para o arquivo de IDs válidos
const IDS_FILE = path.join(__dirname, 'ids.txt');

// Função para ler IDs válidos do arquivo
function getValidIds() {
    try {
        if (!fs.existsSync(IDS_FILE)) {
            // Se o arquivo não existir, criar com alguns IDs de exemplo
            const defaultIds = 'nft001;nft002;nft003;mystery001;box001';
            fs.writeFileSync(IDS_FILE, defaultIds, 'utf8');
            console.log('Arquivo ids.txt criado com IDs de exemplo');
        }
        
        const content = fs.readFileSync(IDS_FILE, 'utf8');
        return content.split(';').map(id => id.trim()).filter(id => id.length > 0);
    } catch (error) {
        console.error('Erro ao ler arquivo de IDs:', error);
        return [];
    }
}

// Função para verificar se um ID é válido
function isValidId(id) {
    const validIds = getValidIds();
    return validIds.includes(id);
}

// Rota principal
app.get('/', (req, res) => {
    res.json({
        message: 'API de NFTs MavisRoads GameFi',
        version: '1.0.0',
        endpoints: {
            'GET /nft/:id': 'Retorna dados da NFT pelo ID'
        }
    });
});

// Rota para buscar NFT por ID
app.get('/nft/:id', (req, res) => {
    const { id } = req.params;
    
    // Verificar se o ID é válido
    if (!isValidId(id)) {
        return res.status(404).json({
            error: 'NFT não encontrada',
            message: `ID '${id}' não é válido ou não existe`,
            validIds: getValidIds()
        });
    }
    
    // Retornar os dados da NFT
    const nftData = {
        name: "Mini Land",
        description: "Hold 5x earn 10 $RON/day Hold 10x earn 25 $RON/day Hold 20x earn 55 $RON/day",
        image: "191.252.179.221/nft/images/mini-land.gif",
        external_url: "http://191.252.179.221"
    };
    
    res.json(nftData);
});

// Rota para listar todos os IDs válidos (útil para debug)
app.get('/ids', (req, res) => {
    const validIds = getValidIds();
    res.json({
        validIds: validIds,
        count: validIds.length
    });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        message: 'A rota solicitada não existe',
        availableRoutes: ['/', '/nft/:id', '/ids']
    });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📡 Acessível em: http://0.0.0.0:${PORT}`);
    console.log(`🌐 Para acesso externo, use o IP público da VPS`);
    console.log(`📋 IDs válidos carregados: ${getValidIds().length}`);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
    console.error('Erro não capturado:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promise rejeitada não tratada:', reason);
    process.exit(1);
});
