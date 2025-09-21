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

// Caminho para o arquivo CSV com metadados
const METADADOS_FILE = path.join(__dirname, 'OfficialMetadados.csv');

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

// Função para fazer parse de linha CSV considerando aspas
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

// Função para ler metadados do CSV
function getMetadadosFromCSV() {
    try {
        if (!fs.existsSync(METADADOS_FILE)) {
            console.error('Arquivo de metadados não encontrado:', METADADOS_FILE);
            return {};
        }
        
        const content = fs.readFileSync(METADADOS_FILE, 'utf8');
        const lines = content.split('\n');
        const metadados = {};
        
        // Pular a primeira linha (cabeçalho)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                const columns = parseCSVLine(line);
                if (columns.length >= 5) {
                    const tokenID = columns[0].trim();
                    const name = columns[1].trim();
                    const description = columns[2].trim();
                    const fileName = columns[3].trim();
                    const hashPower = columns[4].trim();
                    
                    metadados[tokenID] = {
                        name: name,
                        description: description,
                        image: `http://191.252.179.221:3000/nft/images/powercube.gif`,
                        attributes: [
                            {
                                trait_type: "Hash Power",
                                value: hashPower
                            }
                        ],
                        external_url: "http://191.252.179.221"
                    };
                }
            }
        }
        
        return metadados;
    } catch (error) {
        console.error('Erro ao ler arquivo de metadados:', error);
        return {};
    }
}

// Rota principal
app.get('/', (req, res) => {
    res.json({
        message: 'API de NFTs MavisRoads GameFi',
        version: '1.0.0',
        endpoints: {
            'GET /nft/:id': 'Retorna dados da NFT pelo ID',
            'GET /nft/medium/:id': 'Retorna dados da NFT Medium pelo ID',
            'GET /collection/powercube/:id': 'Retorna metadados do Power Cube pelo ID (1-600)'
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
        image: "191.252.179.221:3000/nft/images/mini-land.gif",
        external_url: "http://191.252.179.221"
    };
    
    res.json(nftData);
});

// Rota para buscar NFT Medium por ID
app.get('/nft/medium/:id', (req, res) => {
    const { id } = req.params;
    
    // Verificar se o ID é válido
    if (!isValidId(id)) {
        return res.status(404).json({
            error: 'NFT não encontrada',
            message: `ID '${id}' não é válido ou não existe`,
            validIds: getValidIds()
        });
    }
    
    // Retornar os dados da NFT Medium
    const nftData = {
        name: "Medium Land",
        description: "Hold 5x earn 20 $RON/day Hold 10x earn 50 $RON/day Hold 20x earn 110 $RON/day",
        image: "191.252.179.221:3000/nft/images/medium-land.gif",
        external_url: "http://191.252.179.221"
    };
    
    res.json(nftData);
});

// Rota para buscar Power Cube por ID
app.get('/collection/powercube/:id', (req, res) => {
    const { id } = req.params;
    
    // Converter ID para número e verificar se está no range válido (1-600)
    const tokenID = parseInt(id);
    
    if (isNaN(tokenID) || tokenID < 1 || tokenID > 600) {
        return res.status(404).json({
            error: 'Power Cube não encontrado',
            message: `ID '${id}' deve ser um número entre 1 e 600`,
            validRange: '1-600'
        });
    }
    
    // Buscar metadados do CSV
    const metadados = getMetadadosFromCSV();
    const powerCubeData = metadados[id];
    
    if (!powerCubeData) {
        return res.status(404).json({
            error: 'Power Cube não encontrado',
            message: `Metadados para ID '${id}' não foram encontrados no arquivo CSV`
        });
    }
    
    res.json(powerCubeData);
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
        availableRoutes: ['/', '/nft/:id', '/nft/medium/:id', '/collection/powercube/:id', '/ids']
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
