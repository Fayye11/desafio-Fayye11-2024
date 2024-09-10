class Animal {
    constructor(especie, tamanho, bioma, alimentacao) {
        this.especie = especie;
        this.tamanho = tamanho;
        this.bioma = bioma;
        this.alimentacao = alimentacao;
    }

    adicionarSeViavel(animal, quantidade, recintosViaveis, recinto) {
        if (recinto.verificarEspacoDisponivel(animal, quantidade)) {
            recintosViaveis.push(`Recinto ${recinto.numero} (espaço livre: ${recinto.calcularEspacoRestante()} total: ${recinto.tamanhoTotal})`);
        }
    }
}
class Recinto {
    constructor(numero, bioma, tamanhoTotal) {
        this.numero = numero;
        this.bioma = bioma;
        this.tamanhoTotal = tamanhoTotal;
        this.tamanhoAtual = tamanhoTotal;
        this.animaisNoRecinto = new Map();
    }
    verificarEspacoDisponivel(animal, quantidade) {
        const espacoNecessario = animal.tamanho * quantidade;
        
        if (this.tamanhoAtual < espacoNecessario) {
            return false;
        }

        // Se o recinto já tiver animais da mesma espécie, apenas reduz o espaço
        if (this.animaisNoRecinto.has(animal.especie)) {
            this.tamanhoAtual -= espacoNecessario;
            this.animaisNoRecinto.set(animal.especie, this.animaisNoRecinto.get(animal.especie) + quantidade);
            return true;
        }
        if (animal.bioma.some(b => this.bioma.includes(b)) && this.tamanhoAtual >= espacoNecessario) {
            this.animaisNoRecinto.set(animal.especie, quantidade);
            this.tamanhoAtual -= espacoNecessario;
            if (this.animaisNoRecinto.size > 1) {
                this.tamanhoAtual--;
            }
            return this.tamanhoAtual >= 0;
        }

        return false;
    }

    calcularEspacoRestante() {
        return this.tamanhoAtual;
    }
}

const animaisConfig = {
    'LEAO': { tamanho: 3, bioma: ['savana'], alimentacao: 'carnivoro' },
    'LEOPARDO': { tamanho: 2, bioma: ['savana'], alimentacao: 'carnivoro' },
    'CROCODILO': { tamanho: 3, bioma: ['rio'], alimentacao: 'carnivoro' },
    'MACACO': { tamanho: 1, bioma: ['savana', 'floresta'], alimentacao: 'herbivoro' },
    'GAZELA': { tamanho: 2, bioma: ['savana'], alimentacao: 'herbivoro' },
    'HIPOPOTAMO': { tamanho: 4, bioma: ['savana', 'rio'], alimentacao: 'herbivoro' }
};

const recintoConfig = {
    1: { bioma: ['savana'], tamanhoTotal: 10 },
    2: { bioma: ['floresta'], tamanhoTotal: 5 },
    3: { bioma: ['savana', 'rio'], tamanhoTotal: 7 },
    4: { bioma: ['rio'], tamanhoTotal: 8 },
    5: { bioma: ['savana'], tamanhoTotal: 9 }
};

// Funções auxiliares para criar animais e recintos
function criarAnimal(animal) {
    if (animaisConfig[animal]) {
        const { tamanho, bioma, alimentacao } = animaisConfig[animal];
        return new Animal(animal, tamanho, bioma, alimentacao);
    }
}

function criarRecinto(numero) {
    const { bioma, tamanhoTotal } = recintoConfig[numero];
    return new Recinto(numero, bioma, tamanhoTotal);
}

class RecintosZoo {
    regras(animal, recinto, quantidade) {
        if (animal.alimentacao === 'carnivoro') {
            // Carnívoros só podem ficar sozinhos ou com outros da mesma espécie
            if (recinto.animaisNoRecinto.size === 0 || recinto.animaisNoRecinto.has(animal.especie)) {
                return true;
            }
            return false;
        }

        if (animal.especie === 'HIPOPOTAMO') {
            if (recinto.bioma.includes('savana') && recinto.bioma.includes('rio')) {
                return true;
            }
            return recinto.animaisNoRecinto.size === 0;
        }

        if (animal.especie === 'MACACO') {
            if (recinto.animaisNoRecinto.size === 0 && quantidade < 2) {
                return false;
            }
            return ![...recinto.animaisNoRecinto.keys()].some(especie => ['LEAO', 'LEOPARDO', 'CROCODILO'].includes(especie));
        }

        return true;
    }

    analisaRecintos(animal, quantidade) {
        if (quantidade <= 0) {
            return { erro: "Quantidade inválida" };
        }

        animal = criarAnimal(animal);
        if (!animal) {
            return { erro: "Animal inválido" };
        }

        let recintos = [];
        for (let numero = 1; numero <= 5; numero++) {
            recintos.push(criarRecinto(numero));
        }

        recintos[0].verificarEspacoDisponivel(criarAnimal('MACACO'), 3);
        recintos[2].verificarEspacoDisponivel(criarAnimal('GAZELA'), 1);
        recintos[4].verificarEspacoDisponivel(criarAnimal('LEAO'), 1);

        let recintosViaveis = [];

        recintos.forEach(recinto => {
            if (this.regras(animal, recinto, quantidade)) {
                animal.adicionarSeViavel(animal, quantidade, recintosViaveis, recinto);
            }
        });

        if (recintosViaveis.length === 0) {
            return { erro: "Não há recinto viável" };
        }
        return { recintosViaveis };
    }
}

export { RecintosZoo as RecintosZoo };
