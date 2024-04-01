import { Ollama } from "ollama";

/*
Input examples:
- node index.js "Antecipação de 100mil, taxa de 4%, custo de 1.500 reais em 1º parcela 18/03/2024 e 2º 17/04/2024"
*/

const getResponse = async (input) => {
  const ollama = new Ollama({ host: "http://localhost:11434" });
  const assistant = {
    role: "assistant",
    content: `Você é responsavel por transformar uma frase em código, Você precisa transformar os palavras dessa frase no seguinte payload(objeto javascript) que segue essa interface typescript abaixo:
    interface IAnticpation {
      typeDocument: TypeDocument;
      taxRate: number;
      costOperation: number;nvm
      installmentValues: number[];
      dueDates: Date[];
    }
    enum TypeDocument {
      DUPLICATA = "DUPLICATA",
      CHEQUE = "CHEQUE",
      NOTA_PROMISSORIA = "NOTA_PROMISSORIA",
    }
    Aqui abaixo é um de -> para de possiveis palavras que podem te ajudar a montar esse objeto:
    typeDocument = tipo de calculo, tipo de documento, ou o usuário também pode explicitar diretamente o tipo que são "DUPLICATA", "CHEQUE", "NOTA_PROMISSORIA".
    taxRate = taxa | porcentagem, ou o que vier antes do caracter "%"
    costOperation = custo da operação | custo | encargos | impostos
    dueDates = data de vencimento | vencimento | prazo | validade
    installmentValues = Valor total da antecipação divido pelo número de parcelas(O valor total não inclui taxas e custos)
    installmentValues = Valor total da antecipação divido pelo número de parcelas, e transformado em um array onde a soma das parcelas seja o valor total da antecipação, exemplo: se o usuário escrever que quer antecipar 100mil em 2 parcelas então installmentValues será um array assim: [50000.00, 50000.00]
    Regra: O valor total da antecipação vai ser informado pelo usuário ou o valor cheio ou discriminado valor de cada parcela
    Regra: Os campos installmentValues e dueDates devem ter a mesma quantidade no array e seguir os mesmos indices ou seja a dueDate[0] deve ser correspondente ao installmentValues[0] e caso o numero de vencimentos seja menor que o numero de parcelas voce deve acrescentar as datas sucessivamente de 30 em 30 dias
    Regra: installmentValues pode ser discriminado pelo próprio usuario o valor de cada parcela, mas tambem pode ser informado o valor total da antecipação. Exemplo de como o usuario pode informar esse valor: "Antecipação de 50mil reais..." ou "Simule uma antecipação de 50mil..."
    Regra: installmentValues deve ter o mesmo tamanho que dueDates
    Regra: O valor de cada indice do array de installmentValues não deve sofrer alteração por conta do custo
    Regra: O valor de cada indice do array de installmentValues não deve sofrer alteração por conta da taxa
    Regra: A soma de todos os valores de installmentValues deve ser igual ao valor total da antecipação
    Regra: o Array de dueDates deve ser formado no formato isoString travado em 3h UTC, exemplo "2022-01-01T03:00:00.000Z"
    Regra: A data da primeira parcela deve ser 15 dias a frente do dia atual que no caso é ${new Date().toISOString()}, caso não seja altere o valor do primeiro indice do array de dueDates para 15 dias a frente apartir do dia atual
    Regra: O tipo de documento vai ser por padrão "DUPLICATA" caso não seja informado
    Regra: O tipo de documento deve ser informado
    Regra: O custo da operação deve ser informado
    Regra: A taxa deve ser informada
    Regra: A data de vencimento deve ser informada
    Regra: Sua resposta deve ter apenas o JSON
    Regra: O ano é ${new Date().getFullYear()}
    Regra: O Valor das parcelas deve ser sempre igual, a não ser que o usuário especifique valores diferentes
    Regra: A o intervalo de dias entre as datas de vencimento deve ser sempre 30 dias, a não ser que o usuário especifique vencimentos diferentes
    Regra: Quando não especificado os valores de cada parcela você deve pegar o valor total da antecipação e dividir por o número de parcelas(valor total especificado pelo usuário / numero de parcelas)
    Regra: Caso não seja informado o custo/encargos/impostos da operação, o custo deve ser 0
    Regra: O valor da taxa deve ser um valor inteiro
    Regra: Caso o usuário não fornessa todas as informações necessárias para a operação, o sistema deve retornar uma mensagem de erro: { status: 400, message: "Informações incorretas ou insuficientes para realizar o calculo" }
    Regra: O seu retorno caso sucesso deve ser apenas o objeto em JSON, exemplo: {
      "typeDocument": "DUPLICATA",
      "taxRate": 4,
      "costOperation": 1500,
      "installmentValues": [25000, 25000],
      "dueDates": ["2024-03-19T03:00:00.000Z", "2024-04-18T03:00:00.000Z"]
    }
    Regra: Sempre retorne somente o objeto JSON. Nenhuma outra explicação ou mensagem adicional.`,
  };
  const message = { role: "user", content: input };
  const response = await ollama.chat({
    model: "llama2",
    messages: [assistant, message],
    stream: true,
  });
  console.log("🦙 Response:\n");
  for await (const part of response) {
    process.stdout.write(part.message.content);
  }
  process.stdout.write("\n");
};

const getInput = () => {
  const input = process.argv[2];
  if (!input) {
    console.log(
      "🤖 Please provide a message to send to the model. \n Example: node index.js '2+2?'",
    );
    process.exit(1);
  }
  return input;
};

const main = async () => {
  const input = getInput();
  await getResponse(input);
};

main();
