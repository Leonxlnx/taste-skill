export type Renderer = (value: string) => React.ReactNode;

export type CaretPosition =
  | {
      focused: false;
      selectionStart: number;
      selectionEnd: number;
    }
  | {
      focused: true;
      selectionStart: number;
      selectionEnd: number;
      top: number;
      left: number;
      height: number;
    };
