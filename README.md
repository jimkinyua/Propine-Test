# Propine-Test
I decided to break down the Tasks into Functions.

When a Request is made, data is extracted from the CSV file and pushed into an Array. Once this is Done, a function called **GroupArrayAccordingToToken** is used to group the
the data aaccording to the type of Tokens available in the CSV file.

Once this is Done, the Function **CalCulateBalanceForEachToken** is called to get the Total deposits and Withdrwals for each Group. Once the Balance For each Token is got, the function
**CalculateUSDValueForEachSymbol** is used to make the API calls to the USD prrices for each Token, then multiplies the balance with the USD value to the the portifolio Value.

When filtering the data using dates, the functions **NormalisedDateParameter** and **ConvertedCsvTimeStampToDate** are used to handle the dates. **NormalisedDateParameter** is used to convert the
formart provided by the user into **DD/MM/YYYY** . **ConvertedCsvTimeStampToDate** is used to convert the timestamp in the CSV file into **DD/MM/YYYY**  Both dates are then compared.
If any row in the csv file matches the date, it is added into the array for processing.


# How To Run the Solution

use the command  **get-transactions** to get the results.
 
 # Passing Parameters
 # get-transactions --date "2019/10/25" --token "ETH"
 # get-transactions --token "ETH"
 # get-transactions --date "2019/10/25" 
 
 ## Pass the Dates in this Formart **YYYY-MM-DD**

# Issues Identified during testing

When my tests, I realised the that since CSV file is quite huge,**Javascript heap out of memory**  happens alot. By Increasing the Memory Size to around 4GB ,it worked but this is not
a concrete solution. Processing the data as it's being imported line by line seems to be a better way handle this problem. Unforunately due to time constriants I was not able to 
come up with a tangible solution. For now, kindly bare with the make shift solution. 


Incase you have any questions or clarifications kindly reach out to me through my email jimkinyua25@gmail.com

