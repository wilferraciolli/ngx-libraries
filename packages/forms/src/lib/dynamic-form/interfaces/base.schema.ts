import { FieldDef } from './field-definition';

export interface BaseSchema {
  id: string;
  schemaType: string;
}

export interface SchemaConfig<T extends BaseSchema> {
  schemaType: T['schemaType'];
  fields: FieldDef[];
  initialValue: T;
}
