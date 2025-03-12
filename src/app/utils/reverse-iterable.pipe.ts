import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "reverseIterable" })
export class ReverseIterablePipe implements PipeTransform {
  transform<T>(value: T[]): Iterable<T> {
    return {
      *[Symbol.iterator]() {
        for (let i = value.length - 1; i >= 0; i--) {
          yield value[i];
        }
      },
    };
  }
}
