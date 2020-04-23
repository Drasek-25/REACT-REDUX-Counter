import React from "react";
import { connect } from "react-redux";

const Counter = (props) => {
   const increment = () => {
      props.dispatch({ type: "INCREMENT" });
   };

   const decrement = () => {
      props.dispatch({ type: "DECREMENT" });
   };
   const reset = () => {
      props.dispatch({ type: "RESET" });
   };

   return (
      <div className="counter">
         <h2>Counter</h2>
         <div>
            <button onClick={decrement}>-</button>
            <span className="count">{props.count}</span>
            <button onClick={increment}>+</button>
         </div>
         <button onClick={reset}>↺</button>
      </div>
   );
};

const mapStateToProps = (state) => {
   return {
      count: state.count,
   };
};

export default connect(mapStateToProps)(Counter);
