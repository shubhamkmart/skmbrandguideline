import React from 'react';
import {renderToString} from 'react-dom/server';
import {App,tokenCSS} from './App.jsx';
export {chapters,palette,complementaryPalette,tokens,href} from './data.js';
export {tokenCSS};
export const render=pageId=>renderToString(<App pageId={pageId}/>);
