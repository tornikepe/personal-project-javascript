import {
  dispatchMethod,
  errFuncInterface,
  errFuncInterface2,
} from "./2-TypeScriptProject";

class Transaction implements dispatchMethod<any> {
  scanarioObj: Object[];
  scanarioObj2: Array<any>;
  store: unknown;
  store2: Object;
  readonly logs: Array<any>;

  constructor() {
    this.scanarioObj = [];
    this.scanarioObj2 = [];
    this.store = {};
    this.store2 = {};
    this.logs = [];
  }

  async dispatch(scenario: any) {
    for (let step of scenario) {
      //validation
      if (typeof step.index !== "number") {
        throw new Error("index is not a number");
      } else if (
        typeof step.meta === "undefined" ||
        typeof step.meta.title === "undefined" ||
        typeof step.meta.description === "undefined"
      ) {
        throw new Error("meta,title or description is undefined");
      } else if (
        typeof step.call !== "function" ||
        typeof step.call === "undefined"
      ) {
        throw new Error("call method is undefined or this is undefined");
      }
      this.scanarioObj.push(step.index);
    }

    //sort each index
    this.scanarioObj.sort().forEach((i: object) => {
      for (let step of scenario) {
        if (i === step.index) {
          return this.scanarioObj2.push(step as Object);
        }
      }
    });
    //error function
    const errorFunction: errFuncInterface | errFuncInterface2 = (
      storeBefore,
      step,
      result
    ) => {
      var errorFunctionObj: object | null = {
        ...Object,
        ...{
          index: step.index,
          meta: step.meta,
          storeBefore: storeBefore,
          storeAfter: result,
          error: null,
        },
      };

      return errorFunctionObj;
    };

    //error Object
    const errorObj = (step: any, error: any): object => {
      var errorObjOwn: object | null = {
        ...Object,
        ...{
          index: step.index,
          meta: step.meta,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        },
      };
      return errorObjOwn;
    };

    for (var value of this.scanarioObj2) {
      try {
        var result1 = await value.call(this.store2);
        this.logs.push(errorFunction(this.store2, value, result1));
      } catch (error) {
        try {
          if (typeof value.restore !== "undefined") {
            var result2 = await value.restore(this.store2);
            this.logs.push(errorFunction(this.store2, value, result2));
            this.store = null;
          } else {
            this.logs.push(errorFunction(value, error));
            this.store = {};
          }
        } catch (error) {
          this.logs.push(errorFunction(value, error));
          this.store = {};

          for (
            let element2: number = this.scanarioObj2.indexOf(value) - 1;
            element2 >= 0;
            element2--
          ) {
            var element: any = this.scanarioObj2[element2];

            try {
              var result: any = await element.restore(this.store2);
              this.logs.push(errorFunction(this.store2, element, result));
              this.store = null;
            } catch (error: any) {
              this.logs.push(errorObj(element, error));
              this.store = {};
            }
          }
        }
      }
    }
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const scenario = [
  {
    index: 1,
    meta: {
      title: "Read popular customers",
      description:
        "This action is responsible for reading the most popular customers",
    },
    // callback for main execution
    call: async (store: any) => {},
    // callback for rollback
    restore: async (store: any) => {},
  },
  {
    index: 2,
    meta: {
      title: "Delete customer",
      description: "This action is responsible for deleting customer",
    },
    // callback for main execution
    call: async (store: any) => {},
    // callback for rollback
    restore: async (store: any) => {},
  },
];

const transaction = new Transaction();

(async () => {
  try {
    await transaction.dispatch(scenario);
    const store = transaction.store; // {} | null
    const logs = transaction.logs; // []
    console.log(logs);
  } catch (error) {
    // log detailed error
    console.log(error);
  }
})();
