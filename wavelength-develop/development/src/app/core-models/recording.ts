export class Recording {

  callid: string;
  workstation: string;
  employee: string;
  phoneNumber: string;
  customer: string;
  min_date: string;
  min_startTime: string;
  max_date: string;
  max_startTime: string;
  min_duration: string;
  max_duration: string;
  startedAt: string;
  endedAt: string;
  client: string;
  site: string;
  duration: string;
  url: string;
  noofrecordingsdisplayed: Number = 0;
  page_size: Number = 100;

  GetToStringOfSearchCriteria(): string {
    try {
      let searchcriteria = '';
      if (this.callid != null) {
        searchcriteria = searchcriteria + 'callid=' +
          encodeURIComponent(this.callid) + '&';
      }
      if (this.workstation != null) {
        searchcriteria = searchcriteria + 'workstation=' +
          encodeURIComponent(this.workstation) + '&';
      }
      if (this.employee != null) {
        searchcriteria = searchcriteria + 'employee=' +
          encodeURIComponent(this.employee) + '&';
      }
      if (this.customer != null) {
        searchcriteria = searchcriteria + 'customer=' +
          encodeURIComponent(this.customer) + '&';
      }
      if (this.phoneNumber != null) {
        searchcriteria = searchcriteria + 'phoneNumber=' +
          encodeURIComponent(this.phoneNumber) + '&';
      }
      if (this.min_date != null) {
        searchcriteria = searchcriteria + 'min_date=' +
          encodeURIComponent(this.min_date) + '&';
      }
      if (this.min_startTime != null) {
        searchcriteria = searchcriteria + 'min_startTime=' +
          encodeURIComponent(this.min_startTime.toString()) + '&';
      }
      if (this.max_date != null) {
        searchcriteria = searchcriteria + 'max_date=' +
          encodeURIComponent(this.max_date) + '&';
      }
      if (this.max_startTime != null) {
        searchcriteria = searchcriteria + 'max_startTime=' +
          encodeURIComponent(this.max_startTime.toString()) + '&';
      }
      if (this.min_duration != null) {
        searchcriteria = searchcriteria + 'min_duration=' +
          encodeURIComponent(this.min_duration) + '&';
      }
      if (this.max_duration != null) {
        searchcriteria = searchcriteria + 'max_duration=' +
          encodeURIComponent(this.max_duration) + '&';
      }
      if (this.noofrecordingsdisplayed < 500) {
        searchcriteria = searchcriteria + 'page_size=' +
          encodeURIComponent(`${this.page_size}`) + '&';
      }
      return JSON.parse(JSON.stringify('?' + searchcriteria));

    } catch (e) {
      console.error(e);
      return '';
    }
  }
}
