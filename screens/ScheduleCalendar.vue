<template>
    <div>
        <v-btn @click="convertEventsToSchedule(events)">convert</v-btn>
        <v-btn @click="onSelectSchedule(schedule)" v-for="schedule in schedules">{{schedule.name}}</v-btn>

        <full-calendar :config="config" :events="events" ref="calendar" @event-created="select"
                       @event-resize="onResized" @event-drop="onDrop" />
    </div>
</template>

<script>
  import moment from 'moment';

  export default {
    name: 'ScheduleCalendar',
    data() {
      return {
        schedules: [],
        currentSchedule: null,
        events: [
          // {
          //   title: 'test',
          //   start: moment(),
          //   end: moment().add(1, 'd'),
          //   index: 0
          // },
          // {
          //   title: 'another test',
          //   start: moment().add(1, 'h'),
          //   end: moment()
          //     .add(2, 'h'),
          //   index: 1
          // }
        ],
        config: {
          header: {
            left: '',
            center: '',
            right: ''
          },
          defaultView: 'agendaWeek',
          allDaySlot: false,
          slotLabelFormat: [
            'MMMM YYYY', // top level of text
            'hh: mm'   // lower level of text
          ],
          nowIndicator: true,
          columnHeader: true,
          columnFormat: 'ddd',
          timezone: 'local'
          // eventRender: function (event, element) {
          //   console.log(event);
          // },
          // eventDragStart: e => {
          //   console.log('dragstart', e);
          // },
          // eventDragStop: e => {
          //   console.log('dragstop', e);
          // },
          // eventReceive: e => {
          //   console.log('receive ', e);
          // },
          // eventResizeStop: (e, b, c, d) => {
          // }
          // eventClick: e => {
          //   console.log('click ', e);
          // },
          // select: (start, end, allDay) => {
          //   console.log(start.format(), end.format());
          //   this.events.push({ start, end, title: new Date() });
          //   this.$refs.calendar.fireMethod('refetchEvents')
          //
          // }
        }
      };
    },
    mounted() {
      this.getSchedule();
    },
    methods: {
      onResized(event) {
        console.log(event, this.events, this.events.indexOf(event));
        const newEvent = _.pick(event, ['end', 'start', 'title', 'index']);
        this.$set(this.events, event.index, newEvent);
      },
      onDrop(event) {
        console.log('drop', event, this.events, this.events.indexOf(event));
      },
      select({ start, end }) {
        console.log(start, end);
        let person = prompt('Please enter your name', 'Harry Potter');
        this.$refs.calendar.fireMethod('unselect');

        if (person !== null) {
          this.events.push({ start, end, title: person, playlist: person });

        }
        // this.events.push({ start, end, title: new Date() });

      },
      push() {
        this.events.push({
          title: 'another test',
          start: moment().add(4, 'h'),
          end: moment()
            .add(5, 'h')
        });
      },
      getSchedule() {
        const Schedule = cms.getModel('Schedule');
        Schedule.find({}).then(res => {
          this.schedules = res;
        });
      },
      convertScheduleToEvent(schedule) {
        let events = [];
        for (let i = 0; i < schedule.length; i++) {
          schedule[i].weekdays.forEach(item => {
            events.push({
              playlist: schedule[i].playlist && schedule[i].playlist._id,
              title: schedule[i].playlist && schedule[i].playlist.name,
              index: events.length,
              start: moment(`${item}-${schedule[i].start}`, 'ddd-HH:mm'),
              end: schedule[i].in === 'next day' ? moment(`${item}-${schedule[i].start}`, 'ddd-HH:mm').add(1, 'days') : moment(`${item}-${schedule[i].start}`, 'ddd-HH:mm')
            });
          });
        }
        return events;
      },
      getDaysBetweenDates(start, end) {
        console.log(start.toDate(), end.toDate());

        function getNextDay(current, end) {
          if (!Array.isArray(current)) {
            current = [current];
          }
          const e = current[current.length - 1];
          console.log(e.toDate(), end.toDate(), moment(e).add(1, 'day'), end.diff(e, 'day', true));
          if (!moment(e).add(1, 'day').isSame(moment(end), 'day')) {
            current.push(moment(e).add(1, 'day'));
            return getNextDay(current, end);
          } else {
            return [...current, end];
          }
        }

        return getNextDay(start, end);
      },
      convertEventsToSchedule(events) {
        const schedule = [];
        console.log(events);
        events.forEach(event => {
          const dates = this.getDaysBetweenDates(event.start, event.end);
          console.log(dates.map(i => i.toDate()));
          if (dates.length === 2) {
            schedule.push({
              playlist: event.playlist,
              from: dates[0].format('HH:mm'),
              to: dates[1].format('HH:mm'),
              weekdays: [dates[0].format('dddd')],
              in: dates[1].isSame(dates[0], 'day') ? 'same day' : 'next day'
            });
          } else {
            this.getDaysBetweenDates(event.start, event.end).forEach((date, index, dates) => {
              if (index === 0) {
                schedule.push({
                  playlist: event.playlist,
                  from: date.format('HH:mm'),
                  to: '00:00',
                  weekdays: [date.format('dddd')],
                  in: 'next day'
                });
              } else if (index === dates.length - 1) {
                schedule.push({
                  playlist: event.playlist,
                  from: '00:00',
                  to: date.format('HH:mm'),
                  weekdays: [date.format('dddd')],
                  in: date.format('HH:mm') === '00:00' ? 'next day' : 'same day'
                });
              } else {
                schedule.push({
                  playlist: event.playlist,
                  from: '00:00',
                  to: '00:00',
                  weekdays: [date.format('dddd')],
                  in: 'next day'
                });
              }
            });

          }
          // this.getDaysBetweenDates(event.start, event.end).forEach((date, index, dates) => {
          //   if (index === 0) {
          //     schedule.push()
          //   }
          // });
          //
          // console.log(this.getDaysBetweenDates(event.start, event.end).map(i => i.format('ddd, HH mm')));
          // schedule.push({
          //   playlist: i.playlist
          // });
          // console.log(this.getDaysBetweenDates(i.start, i.end).map(i => moment.weekdays(i.weekday())));
        });
        console.log(schedule);
      },
      onSelectSchedule(schedule) {
        this.currentSchedule = schedule;
        console.log(schedule);
        this.events = this.convertScheduleToEvent(schedule.weekdaySchedule);
      }
    }
  };
</script>

<style scoped>

</style>
