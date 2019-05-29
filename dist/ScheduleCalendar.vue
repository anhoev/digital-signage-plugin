<template>
    <v-layout row="" style="height: 100%">
        <div>
            <v-dialog :width="1000" v-model="showDialogSelectPlaylist">
                <div style="background-color: #fff; padding: 20px " v-if="currentEvent">
                    <!--                <v-select :items="playlist" label="Playlist" item-value="_id" item-text="name"-->
                    <!--                          v-model="selectedPlaylist"></v-select>-->
                    <g-field :field="playlistField" :model="dialogModel" :key="currentEvent.key"></g-field>
                    <v-btn flat="" @click="save" v-if="currentEvent.key">Save</v-btn>
                    <v-btn flat="" @click="create" v-else="">Create</v-btn>
                    <v-btn flat="" @click="showDialogSelectPlaylist = false">Cancel</v-btn>
                </div>
            </v-dialog>
        </div>
        <v-flex shrink="" style="border-right: 1px solid #ddd; width: 300px; max-height: calc(100vh - 50px); overflow: auto; background: #fff">
            <v-list dense="" two-line="" avatar="">
                <template v-for="(item, index) in schedules">
                    <v-list-tile :key="item._id" :class="{'selected-playlist':isSelected(item)}" @click="onSelectSchedule(item)">
                        <v-list-tile-content>
                            <v-list-tile-title>{{item.name}}</v-list-tile-title>
                            <!--                            <v-list-tile-sub-title>{{item.resolution}} <span v-if="!item.isRegistered">(Code: {{item.deviceCode}})</span>-->
                            <!--                            </v-list-tile-sub-title>-->
                        </v-list-tile-content>
                        <!--                        <v-list-tile-action>-->
                        <!--                            <i class="fas fa-circle" :class="isOnline(item)?'online':'offline'"></i>-->
                        <!--                        </v-list-tile-action>-->
                    </v-list-tile>
                    <v-divider style="opacity: 0.5; margin: 0 20px"></v-divider>
                </template>
                <v-list-tile @click="newSchedule">
                    <v-list-tile-content>
                        <v-list-tile-title> +</v-list-tile-title>
                        <!--                            <v-list-tile-sub-title>{{item.resolution}} <span v-if="!item.isRegistered">(Code: {{item.deviceCode}})</span>-->
                        <!--                            </v-list-tile-sub-title>-->
                    </v-list-tile-content>
                    <!--                        <v-list-tile-action>-->
                    <!--                            <i class="fas fa-circle" :class="isOnline(item)?'online':'offline'"></i>-->
                    <!--                        </v-list-tile-action>-->
                </v-list-tile>
            </v-list>
        </v-flex>
        <v-flex v-if="selectedSchedule" style="border-left: 1px solid #ddd; flex: 1; min-width: 0; max-height: calc(100vh - 50px); overflow: auto">
            <g-field :fields="scheduleField" :model="scheduleModel"></g-field>
            <div style="flex: 1">
                <full-calendar :config="config" :events="events" ref="calendar" @event-created="onCreate" @event-resize="onResized" @event-drop="onDrop" @event-selected="onSelected">
            </full-calendar></div>

            <v-btn @click="saveSchedule" flat="">Save</v-btn>
        </v-flex>
    </v-layout>
    <!--    <div>-->
    <!--        <v-btn @click="convertEventsToSchedule(events)">convert</v-btn>-->
    <!--        <v-btn @click="add">Add</v-btn>-->
    <!--        <v-btn @click="onSelectSchedule(schedule)" v-for="schedule in schedules">{{schedule.name}}</v-btn>-->

    <!--        <full-calendar :config="config" :events="events" ref="calendar" @event-created="onCreate"-->
    <!--                       @event-resize="onResized" @event-drop="onDrop" />-->

    <!--    </div>-->
</template>
<script>
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _moment = _interopRequireDefault(require("moment"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  name: 'ScheduleCalendar',

  data() {
    return {
      scheduleModel: {},
      scheduleField: [{
        '_id': '5ca3291a96a316f1ac376c99',
        'schemaType': 'string',
        'key': 'name',
        'type': 'input',
        'flex': 'md4'
      }, {
        '_id': '5ca70d7894da6c1848b2387b',
        'schemaType': 'date',
        'key': 'activeFrom',
        'type': 'input@date',
        'flex': 'md4'
      }, {
        '_id': '5ca70d7894da6c1848b2387a',
        'schemaType': 'date',
        'key': 'activeTo',
        'type': 'input@date',
        'flex': 'md4'
      }],
      schedules: [],
      events: [// {
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
        slotLabelFormat: ['MMMM YYYY', // top level of text
        'hh: mm' // lower level of text
        ],
        nowIndicator: true,
        columnHeader: true,
        columnFormat: 'ddd',
        timezone: 'local',
        selectable: true,
        unselectAuto: false
      },
      showDialogSelectPlaylist: false,
      playlist: [],
      selectedPlaylist: null,
      selectedSchedule: undefined,
      currentEvent: null,
      dialogModel: {},
      playlistField: {
        '_id': '5ca3291a96a316f1ac376c98',
        'schemaType': 'array',
        'key': 'weekdaySchedule',
        'type': 'tableArray',
        'fields': [{
          'schemaType': 'array',
          'key': 'weekdays',
          'fields': [{
            'schemaType': 'string'
          }],
          'type': 'input@multiSelect',
          'optionsType': 'onlyValue',
          'options': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          'tableCell': true
        }, {
          'schemaType': 'string',
          'key': 'from',
          'type': 'time-picker',
          'tableCell': true
        }, {
          'schemaType': 'string',
          'key': 'to',
          'default': '',
          'type': 'time-picker',
          'tableCell': true
        }, {
          'schemaType': 'string',
          'key': 'in',
          'default': 'this day',
          'type': 'input@select',
          'optionsType': 'onlyValue',
          'options': ['same day', 'next day'],
          'tableCell': true
        }, {
          'schemaType': 'objectId',
          'key': 'playlist',
          'ref': 'Playlist',
          'autopopulate': true,
          'type': 'ref-select',
          'labelProp': 'name',
          'tableCell': true
        }]
      }
    };
  },

  watch: {
    showDialogSelectPlaylist(v) {
      if (!v) {
        this.$refs.calendar.fireMethod('unselect');
        this.currentEvent = null;
      }
    } // selectedSchedule: {
    //   handler(v) {
    //     if (v) {
    //       console.log('events', this.convertScheduleToEvent(v.weekdaySchedule));
    //       this.events = this.convertScheduleToEvent(v.weekdaySchedule);
    //     }
    //   },
    //   deep: true
    // }


  },

  mounted() {
    this.getSchedule();
    this.getPlaylist();
  },

  methods: {
    isSelected(item) {
      return this.selectedSchedule && item._id === this.selectedSchedule._id;
    },

    getPlaylist() {
      cms.getModel('Playlist').find({}).then(res => {
        this.playlist = res;
      });
    },

    onResized(event) {
      const currentEvents = this.events.findIndex(item => item.key === event.key);

      if (currentEvents > -1) {
        const newEvent = _.pick(event, ['end', 'start', 'title', 'index', 'key']);

        this.$set(this.events, currentEvents, newEvent);
      }
    },

    // add() {
    //   this.schedules.push({ weekdaySchedule: this.convertEventsToSchedule(this.events), name: 'HEEHHEHE' });
    // },
    onCreate(event) {
      // this.$refs.calendar.fireMethod('unselect');
      setTimeout(() => {
        this.showDialogSelectPlaylist = true;
        this.currentEvent = event;
        this.dialogModel = {
          weekdaySchedule: this.convertEventsToSchedule([event])
        };
      }, 30);
    },

    onSelected(event, jsEvent, view) {
      this.showDialogSelectPlaylist = true;
      this.currentEvent = event;
      this.dialogModel = {
        weekdaySchedule: this.convertEventsToSchedule([event])
      };
    },

    save() {
      const current = this.events.findIndex(i => i.key === this.currentEvent.key);

      if (current > -1) {
        this.events.splice(current, 1);
        this.events.push(...this.convertScheduleToEvent(this.dialogModel.weekdaySchedule)); // this.events.push({ start: event.start, end: event.end, title: this.selectedPlaylist, playlist: this.selectedPlaylist, key: this.genKey() });

        this.showDialogSelectPlaylist = false;
      } // }
      // this.events.push({ start, end, title: new Date() });

    },

    create(model) {
      this.events.push(...this.convertScheduleToEvent(this.dialogModel.weekdaySchedule)); // this.events.push({ start: event.start, end: event.end, title: this.selectedPlaylist, playlist: this.selectedPlaylist, key: this.genKey() });

      this.showDialogSelectPlaylist = false; // }
      // this.events.push({ start, end, title: new Date() });
    },

    onDrop(event) {
      const currentEvents = this.events.findIndex(item => item.key === event.key);

      if (currentEvents > -1) {
        const newEvent = _.pick(event, ['end', 'start', 'title', 'index', 'key']);

        this.$set(this.events, currentEvents, newEvent);
      }
    },

    // push() {
    //   this.events.push({
    //     title: 'another test',
    //     start: moment().add(4, 'h'),
    //     end: moment()
    //       .add(5, 'h')
    //   });
    // },
    genKey(length = 16) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      return new Array(length).fill().reduce(acc => {
        return acc + characters.charAt(Math.floor(Math.random() * charactersLength));
      }, Math.round(+new Date() / 1000).toString(16));
    },

    getSchedule() {
      const Schedule = cms.getModel('Schedule');
      Schedule.find({}).then(res => {
        this.schedules = res;
      });
    },

    async newSchedule() {
      const a = await cms.getModel('Schedule').new();
      this.selectedSchedule = a;
      this.scheduleModel = {
        name: ''
      };
      this.events = [];
    },

    async saveSchedule() {
      await cms.getModel('Schedule').findByIdAndUpdate(this.selectedSchedule._id, {
        weekdaySchedule: this.convertEventsToSchedule(this.events),
        ...this.scheduleModel
      }, {
        upsert: true,
        new: true
      });
      this.getSchedule();
      alert('save success full');
    },

    getPlaylistTitle(id) {
      const playlist = this.playlist.find(item => item._id === id);

      if (playlist) {
        return playlist.name;
      }

      return id;
    },

    convertScheduleToEvent(schedule) {
      let events = [];

      for (let i = 0; i < schedule.length; i++) {
        schedule[i].weekdays.forEach(item => {
          events.push({
            playlist: schedule[i].playlist && (schedule[i].playlist._id || schedule[i].playlist),
            title: this.getPlaylistTitle(schedule[i].playlist && (schedule[i].playlist._id || schedule[i].playlist)),
            index: events.length,
            key: this.genKey(),
            start: (0, _moment.default)(`${item}-${schedule[i].from}`, 'ddd-HH:mm'),
            end: schedule[i].in === 'next day' ? (0, _moment.default)(`${item}-${schedule[i].to}`, 'ddd-HH:mm').add(1, 'days') : (0, _moment.default)(`${item}-${schedule[i].to}`, 'ddd-HH:mm')
          });
        });
      }

      return events;
    },

    getDaysBetweenDates(start, end) {
      function getNextDay(current, end) {
        if (!Array.isArray(current)) {
          current = [current];
        }

        console.log('currrent', current);
        const e = current[current.length - 1];
        console.log(e.toDate(), end.toDate(), (0, _moment.default)(e).add(1, 'day'), end.diff(e, 'day', true));

        if (!(0, _moment.default)(e).add(1, 'day').isSameOrAfter((0, _moment.default)(end), 'day')) {
          current.push((0, _moment.default)(e).add(1, 'day'));
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
        console.log('dates;', dates.map(i => i.toDate()));

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
        } // this.getDaysBetweenDates(event.start, event.end).forEach((date, index, dates) => {
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
      return schedule;
    },

    onSelectSchedule(schedule) {
      cms.getModel('Schedule').findById(schedule._id).then(res => {
        this.selectedSchedule = res;
        this.scheduleModel = {
          name: res.name,
          activeFrom: new Date(res.activeFrom),
          activeTo: new Date(res.activeTo)
        };
        this.events = this.convertScheduleToEvent(res.weekdaySchedule);
      });
    }

  }
};
exports.default = _default;
</script> 
<style scoped>.selected-playlist {
  background-color: #03a9f4;
  color: #fff !important; }
  .selected-playlist .v-list__tile__title {
    transition: none !important; }
  .selected-playlist .v-list__tile__sub-title {
    color: #fff !important; }
</style>
