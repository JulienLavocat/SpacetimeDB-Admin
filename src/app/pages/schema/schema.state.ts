import { inject, Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { RawModuleRef9 } from "../../api/raw-types";
import { ApiService } from "../../api/api.service";
import { LoadSchema } from "./schema.actions";

export interface SchemaStateModel {
  isLoading: boolean;
  schema: RawModuleRef9 | null;
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
    ctx.patchState({ isLoading: true });

    return this.api.getRawSchema().pipe(
      tap((data) =>
        ctx.patchState({
          schema: data,
          isLoading: false,
        }),
      ),
    );
  }
}
