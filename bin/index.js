#!/usr/bin/env node

const yargs = require('yargs');
const Fs = require('fs');
const CsvReadableStream = require('csv-reader');
const axios = require('axios');

const inputStream = Fs.createReadStream("E:\\Propine\\transactions.csv", 'utf8');
const csvData =[];
const res = 0;
var groupedResult =[] ;
const groupedBalance = {};
let arrayWithUSDValue = [];

parameters = yargs.argv;
// console.log(parameters);

const apiVariables ={
    token: 'a437b4c681a49c9b45382a38c319ed0a795b9180041154d9dc5702e534e72107'
}

if(parameters.date && parameters.token){// Both Params provided
    console.log('both provided');
    inputStream.pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
    .on('data', (row)=> {
        csvData.push(row);
    })
    .on('end', function () {


        return CalculateUSDValueForEachSymbol(
                    CalCulateBalanceForEachToken(
                        GroupArrayAccordingToTokenAndDate(csvData,  parameters.date,  parameters.token)
                    )
                );

    });


}else if(parameters.token){ //Token Provided

    inputStream.pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
    .on('data', (row)=> {
        csvData.push(row);
    })
    .on('end', function () {

      return CalculateUSDValueForEachSymbol( 
                CalCulateBalanceForEachToken(
                    GroupArrayAccordingToToken(csvData, parameters.token)
                ) 
            );

    });

}else if(parameters.date){//Date Provided
    console.log('date provided')
    
    inputStream.pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
    .on('data', (row)=> {
        csvData.push(row);
    })
    .on('end', function () {
        //ToDo: Check date Format to be valid
       return CalculateUSDValueForEachSymbol(
                CalCulateBalanceForEachToken(
                    GroupArrayAccordingToDate(csvData, parameters.date)
                )
            );

    });

}else{//None Provided
        
    inputStream.pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
        .on('data', (row)=> {
            csvData.push(row);
        })
        .on('end', function () {

            return CalculateUSDValueForEachSymbol(
                        CalCulateBalanceForEachToken(
                            GroupArrayAccordingToToken(csvData)
                        )
                    );
        });

}



function CalculateUSDValueForEachSymbol(objectWithBalance) {

    if(objectWithBalance){// Check if array is empty

        for (let tokenSymbol in  objectWithBalance){
            
            const url = `https://min-api.cryptocompare.com/data/price?fsym=${tokenSymbol}&tsyms=USD&api_key=${apiVariables.token}`;
            if(objectWithBalance[tokenSymbol].Balance){
                axios.get(url)
                .then(response => {

                    arrayWithUSDValue[tokenSymbol] = {
                        LastestBalance: ((groupedBalance[tokenSymbol].Balance * response.data.USD))
                    };

                    console.log(arrayWithUSDValue)

                })
                .catch(error => {
                    console.log(error);
                });
            }else{
                continue
            }

        }


    }

    


}

function CalCulateBalanceForEachToken(GroupedArray) {
    for (let tokenSymbol in GroupedArray) {
        // console.log(GroupedArray)
        const accumulated = GroupedArray[tokenSymbol].reduce((acc, curr) => {
            if(curr[1] == 'DEPOSIT'){
                acc[curr[1]] += curr[3]; 
            }
            if(curr[1] == 'WITHDRAWAL'){
                acc[curr[1]] += curr[3]; 
            }
            return acc; // ← return the accumulator to use for the next round
        }, { DEPOSIT: 0, WITHDRAWAL: 0 });
        
        groupedBalance[tokenSymbol] = {
            Balance: accumulated['DEPOSIT'] - accumulated['WITHDRAWAL']
        };

    }
    return groupedBalance;


}


function GroupArrayAccordingToTokenAndDate(ExraxtedCsvData, Date, Token) {

    let ArrayGroupedAccordingToTokenAndDate = [];
    ArrayGroupedAccordingToTokenAndDate = ExraxtedCsvData.reduce((acc, curr) => {

        if((ConvertedCsvTimeStampToDate(curr[0]) == NormalisedDateParameter(Date))){ //Check if Dates Match then group by Token
           
            if(curr[2] == Token){
                if (!acc[curr[2]]) {
                    acc[curr[2]] = [];
                }else{
                        acc[curr[2]].push(curr);
                }
            }
        }

        return acc;

    }, []);
    
   
    return ArrayGroupedAccordingToTokenAndDate;
}

function GroupArrayAccordingToToken(ExraxtedCsvData, token=null) {
    let ArrayGroupedAccordingToToken= [];

    if(token == null){//// No Token was provided, Filter with the Symbols that are in the CSV
        ArrayGroupedAccordingToToken = ExraxtedCsvData.reduce((acc, curr) => {
            if (!acc[curr[2]]) {
                acc[curr[2]] = [];
            }
            acc[curr[2]].push(curr);
            return acc;
        }, []);
    }else{
        ArrayGroupedAccordingToToken = ExraxtedCsvData.reduce((acc, curr) => {

            if(curr[2] == token){
                if (!acc[curr[2]]) {
                    acc[curr[2]] = [];
                }
                acc[curr[2]].push(curr);
            }
            return acc;
        }, []);
    }
   
    return ArrayGroupedAccordingToToken;
}

function GroupArrayAccordingToDate(ExraxtedCsvData, paramDate) {

    let ArrayGroupedAccordingToDate = [];
    ArrayGroupedAccordingToDate = ExraxtedCsvData.reduce((acc, curr) => {

        if((ConvertedCsvTimeStampToDate(curr[0]) == NormalisedDateParameter(paramDate))){ //Check if Dates Match
           
            if (!acc[curr[2]]) {
                acc[curr[2]] = [];
            }else{
                    acc[curr[2]].push(curr);
            }
            
        }
        return acc;
    }, []);


    return ArrayGroupedAccordingToDate;

}
function ConvertedCsvTimeStampToDate(TimeStampFromCsv) {
    let date = new Date(TimeStampFromCsv * 1000);
    let dateFromCSV = date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear();
    return dateFromCSV;
}

function NormalisedDateParameter(paramDate) {
    let dateFromParameter = new Date(paramDate);
    let normalisedDate = dateFromParameter.getDate() + '/' + (dateFromParameter.getMonth() + 1) + '/' + dateFromParameter.getFullYear();
    // console.log(dateFromParameter);

    return normalisedDate;
}
// console.log('sdfgh');

