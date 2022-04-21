#!/usr/bin/env node

const yargs = require('yargs');
const Fs = require('fs');
const CsvReadableStream = require('csv-reader');
const axios = require('axios');

const inputStream = Fs.createReadStream("E:\\Propine\\test.csv", 'utf8');
const csvData =[];
const res = 0;
var groupedResult =[] ;
const groupedBalance = {};
const groupedApiResult = {};

parameters = yargs.argv;
// console.log(parameters);

const apiVariables ={
    token: 'a437b4c681a49c9b45382a38c319ed0a795b9180041154d9dc5702e534e72107'
}

if(parameters.date && parameters.token){// Both Params provided
    console.log('both provided');
}else if(parameters.token){ //Token Provided

    inputStream.pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
    .on('data', (row)=> {
        csvData.push(row);
    })
    .on('end', function () {

      groupedResult = csvData.reduce((acc, curr) => {
            if(!acc[parameters.token]){
                acc[parameters.token] = [];
            }else{
                if(curr[2] == parameters.token){
                    acc[parameters.token].push(curr)
                }
            }
            return acc;
        },[]);

        for(let groupName in groupedResult) {
            const accumulated = groupedResult[groupName].reduce((acc, curr)=>{
                acc[curr[1]] += curr[3];
                return acc; // ← return the accumulator to use for the next round
            }, {DEPOSIT: 0, WITHDRAWAL: 0})

            groupedBalance[groupName] = {
                Balance: accumulated['DEPOSIT'] - accumulated['WITHDRAWAL']
            };
            
        }

        if(groupedBalance){
            for (let Gname in  groupedBalance){
                const url = `https://min-api.cryptocompare.com/data/price?fsym=${Gname}&tsyms=USD&api_key=${apiVariables.token}`;
                if(groupedBalance[Gname].Balance){
                    axios.get(url)
                    .then(response => {
                         groupedApiResult[Gname] = {
                            LastestBalance: ((groupedBalance[Gname].Balance * response.data.USD))
                        };
                        console.log(groupedApiResult);
        
                    })
                    .catch(error => {
                        console.log(error);
                    });
                } else{
                    console.log('Token Not Found')
                }   
            }
        }
        
   
       

    });

}else if(parameters.date){//Date Provided
    console.log('date provided')
}else{//None Provided
        
    inputStream.pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
        .on('data', (row)=> {
            csvData.push(row);
        })
        .on('end', function () {
            GroupArrayAccordingToToken(csvData);
            CalCulateBalanceForEachToken(groupedResult);
            CalculateUSDValueForEachSymbol(groupedBalance);
        });

}



function CalculateUSDValueForEachSymbol(arrayWithBalance) {
    for (let Gname in arrayWithBalance) {
        axios.get('https://min-api.cryptocompare.com/data/price?fsym=' + Gname + '&tsyms=USD&api_key=a437b4c681a49c9b45382a38c319ed0a795b9180041154d9dc5702e534e72107')
            .then(response => {
                groupedApiResult[Gname] = {
                    LastestBalance: ((arrayWithBalance[Gname].Balance * response.data.USD))
                };
                console.log(groupedApiResult);
            })
            .catch(error => {
                console.log(error);
            });

    }
}

function CalCulateBalanceForEachToken(GroupedArray) {
    for (let tokenSymbol in GroupedArray) {
        const accumulated = groupedResult[tokenSymbol].reduce((acc, curr) => {
            acc[curr[1]] += curr[3];
            return acc; // ← return the accumulator to use for the next round
        }, { DEPOSIT: 0, WITHDRAWAL: 0 });
        groupedBalance[tokenSymbol] = {
            Balance: accumulated['DEPOSIT'] - accumulated['WITHDRAWAL']
        };

    }
}

function GroupArrayAccordingToToken(ExraxtedCsvData) {
    groupedResult = ExraxtedCsvData.reduce((acc, curr) => {
        if (!acc[curr[2]]) {
            acc[curr[2]] = [];
        }
        acc[curr[2]].push(curr);
        return acc;
    }, []);
    return groupedResult;
}
// console.log('sdfgh');

