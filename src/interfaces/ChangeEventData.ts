export default interface ChangeEventData {
  event: 'change';
  value: any;
  prevValue: any;
  error?: Error;
  // path to field
  field: string;
}
