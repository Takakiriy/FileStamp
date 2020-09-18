import React from 'react';

export const  MyContextValue = {  // for out of React
    isTestMode: false,
    userMailAddress: "",
};
export const  MyContext = React.createContext(MyContextValue);
