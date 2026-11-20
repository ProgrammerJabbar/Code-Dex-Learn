// React is loaded from the CDN as a global (UMD build), so modules import it from here.
const R = window.React;
export default R;
export const {
  useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback, useReducer,
  createContext, useContext, Fragment, memo, forwardRef, createElement, Children, cloneElement,
} = R;
