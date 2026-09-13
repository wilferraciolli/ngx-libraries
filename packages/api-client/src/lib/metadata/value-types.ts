/** A single `{ id, value }` pair, as returned in API metadata option lists. */
export interface IdValue {
  id: string;
  value: string;
}

/** Bare resource id, e.g. for a create/select payload that only needs the id. */
export interface Id {
  id: string;
}

/** A value paired with its display label, for select/autocomplete options. */
export class ValueViewValue {
  value: string;
  viewValue: string;

  constructor(value: string, viewValue: string) {
    this.value = value;
    this.viewValue = viewValue;
  }
}
