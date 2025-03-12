import { inject, Injectable } from "@angular/core";
import { Action, State, StateContext, Selector } from "@ngxs/store";
import { tap } from "rxjs";
import { ApiService, Schema } from "../../api.service";
import { LoadSchema } from "./schema.actions";

export interface SchemaStateModel {
  isLoading: boolean;
  schema: Schema | null;
}

@State<SchemaStateModel>({
  name: "schema",
  defaults: {
    isLoading: false,
    schema: null,
  },
})
@Injectable()
export class SchemaState {
  private readonly api = inject(ApiService);

  @Selector()
  static selectIsLoading(state: SchemaStateModel) {
    return state.isLoading;
  }

  @Selector()
  static selectSchema(state: SchemaStateModel) {
    return state.schema;
  }

  @Action(LoadSchema)
  loadSchema(ctx: StateContext<SchemaStateModel>) {
    return this.api.getSchema().pipe(
      tap((data) =>
        ctx.patchState({
          schema: data,
        }),
      ),
    );
  }
}
