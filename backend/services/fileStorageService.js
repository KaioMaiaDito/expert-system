const fs = require('fs');
const path = require('path');

class FileStorageService {
  static getDefaultFilePath() {
    // Define o caminho padrão para o arquivo JSON com os dados
    return path.resolve(__dirname, '..', 'data', 'sampleData.json');
  }

  static readData(filePath = FileStorageService.getDefaultFilePath()) {
    try {
      const absolutePath = path.resolve(filePath);
      if (!fs.existsSync(absolutePath)) {
        return {};
      }
      const fileContent = fs.readFileSync(absolutePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      console.error('Erro ao ler o arquivo:', error);
      throw error;
    }
  }

  static writeData(filePath = FileStorageService.getDefaultFilePath(), data) {
    try {
      const absolutePath = path.resolve(filePath);
      fs.writeFileSync(absolutePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Erro ao escrever no arquivo:', error);
      throw error;
    }
  }
}

module.exports = FileStorageService;
