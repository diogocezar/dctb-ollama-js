import { Ollama } from "ollama";

/*
Input examples:
- node index.js "Taxa: 3%, Tarifas: 400,00, Valor: 2.000,00, Vencimento: 31/10/2024"
- node index.js "Taxa: 2.5%, Tarifas: 200,00, Valor: 1.000,00, Vencimento: 01/05/2024"
- node index.js "Taxa: 4%, Tarifas: 150,00, Valor: 2.500,00, Vencimento: 30/04/2024"
- node index.js "Taxa: 2.7%, Tarifas: 150,00, Valor: 1.500,00, Vencimento: 31/05/2024"
*/

const getResponse = async (input) => {
  const ollama = new Ollama({ host: "http://localhost:11434" });
  const assistant = {
    role: "assistant",
    content:
      "Você deve se comportar como uma calculadora para retornar o valor a receber de cheques e duplicatas. Os tipos de operação podem ser de empréstimo. Caso seja do tipo empréstimo, deve-se obter as informações de taxa cobrada ao mês, valor de tarifas, valor e vencimento. Por exemplo, se as entradas forem: Taxa: 2.5%, Tarifas R$ 200,00, Valor R$ 1000,00 e vencimento 01/05/2024. (Supondo que hoje é 31/03/2024). Então os resultados deveriam ser: Você investe: 1.000, Você recebe: 1.232,91, Taxa de Juros 2.5%, Tarifas 200,00 e O lucro: 230,82. Um outro exemplo de entrada: Taxa: 3%, Tarifas R$ 400,00, Valor R$ 2000,00 e vencimento 31/10/2024. (Supondo que hoje é 31/03/2024). Então os resultados deveriam ser: Você investe: 2.000,00 Você recebe: 3.141,15 Taxa de Juros 3%, Tarifas 400,00 e O lucro: 494,23. Um outro exemplo de entrada: Taxa: 4%, Tarifas R$ 150,00, Valor R$ 2500,00 e vencimento 30/04/2024. (Supondo que hoje é 31/03/2024). Então os resultados deveriam ser: Você investe: 2.500,00 Você recebe: 2.764,34 Taxa de Juros 4%, Tarifas 150,00 e O lucro: 260,57. Here's how I arrived at these results: First, we need to calculate the amount of money that will be received each month. To do this, we divide the total value by the number of installments (in this case, 12): 2.500,00 / 12 = 208,33 Next, we need to calculate the operational cost, which is the amount of money that will be spent each month on interest and fees. We can calculate this by multiplying the total value by the tax rate (4%) and the number of installments: 2.500,00 x 4% x 12 = 100,80 Now, we need to subtract the operational cost from the total value to get the amount that will be received each month: 2.500,00 - 100,80 = 197,40 Finally, we can calculate the due date by using the formula: dueDate = loanDate + (installments x number of days in a month) In this case, the due date would be: 30/04/2024 + (12 x 30) = 31/05/2024 So, the results are: Você investe R$ 2.500,00, Você recebe R$ 2.764,34, Taxa de Juros é de 4%, Tarifas são de R$ 150,00, e o lucro é de R$ 260,57. Você sempre deve esperar as mesmas entradas. Se você não receber as mesmas entradas, você deve retornar um erro. As entradas devem ser: Taxa, Tarifas, Valor e Vencimento. Você sempre deverá retornar o valor a receber, a taxa de juros, o valor das tarifas e o lucro. Considere o trecho de código como a calculadora que você deve ser: async run(loanDto:LoanDto):Promise<ILoanOperation|undefined>{constvalidatedLoanDto:LoanDto=await getValidDto(loanDto,LoanDto)const{operationalCost,loanDate,installments,taxRate,ammount}=validatedLoanDtoconst ammoutToBeAnticipated=ammount const fixedCost=operationalCost const totalValue=ammoutToBeAnticipated+fixedCostconst monthlyTax=taxRate/100 const firstInstallmentDate=new Date(loanDate)const dateOfToday=new Date()const dueDateArr:number[]=[]let faceValue=(ammoutToBeAnticipated+fixedCost)/installments let flag=true const calculateDueDateInDays=(startDate:Date,endDate:Date)=>{const newEndDate=new Date(endDate);const weekDay=newEndDate.getDay();const additionDays=(days:number)=>newEndDate.setDate(newEndDate.getDate()+days);const dates={0:()=>additionDays(2),5:()=>additionDays(3),6:()=>additionDays(2),default:()=>additionDays(1)};if(dates[weekDay]){dates[weekDay]()}else{dates.default()}return Math.ceil((newEndDate.getTime()-startDate.getTime())/(1000*3600*24),)}for(let index=0;index<installments;index++){dueDateArr.push(calculateDueDateInDays(dateOfToday,firstInstallmentDate));firstInstallmentDate.setMonth(firstInstallmentDate.getMonth()+1)}while(flag){let netTotal=0;const netValues=Array.from({length:dueDateArr.length});const discounts=Array.from({length:dueDateArr.length});for(let index=0;index<dueDateArr.length;++index){const discount=faceValue*(1+monthlyTax)**(dueDateArr[index]/30)-faceValue;if(discount>=faceValue){discounts[index]=faceValue}else{discounts[index]=discount}if(discount>ammoutToBeAnticipated){throw new HttpException('O prazo para pagamento a antecipação excedeu o limite de dias.Escolha outra data!',400,)}netValues[index]=faceValue-discount;const netValue=faceValue-discount;netTotal+=netValue;if(netTotal>totalValue){flag=false;return{dueDateArr,faceValue,discounts,netValues,totalCost:totalValue}}faceValue+=ammoutToBeAnticipated>=1_000_000?0.25:0.01}}}; --- Você deve ser objetivo e direto. Retornando apenas os valores solicitados. Não explique como chegou nos resultados. Responda em Portugês Brasil.",
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
