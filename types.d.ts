// 覆盖 @radix-ui/react-slot 的类型定义
import * as React from 'react';

declare module '@radix-ui/react-slot' {
  export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
    children?: React.ReactNode;
  }
  
  export const Slot: React.ForwardRefExoticComponent<
    SlotProps & React.RefAttributes<HTMLElement>
  >;

  export const Slottable: React.FC<{
    children: React.ReactNode;
  }>;
} 