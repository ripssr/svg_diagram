'use strict';

const stats = [
  { label: 'A', value: 100 },
  { label: 'B', value: 100 },
  { label: 'C', value: 100 },
  { label: 'D', value: 100 },
  { label: 'E', value: 100 },
  { label: 'F', value: 100 }
];


const store = new Vuex.Store({
  state: {
    stats: stats,
    newLabel: '',
    valueToPoint: (value, total, index) => {
      let y = -value * 0.8;
      let angle = (Math.PI << 1) / total * index;
      return {
        x: 100 - y * Math.sin(angle),
        y: 100 + y * Math.cos(angle)
      }
    }
  },
  mutations: {
    addStats: state => (state.stats.push({
        label: state.newLabel,
        value: 100
      })) && (state.newLabel = ''),

    removeStat: (state, stat) => state.stats.splice(state.stats.indexOf(stat), 1),
    changeStat: (state, payload) => {
      for (let i = 0; i < state.stats.length; i++) {
        state.stats[i].label == payload[1] && (state.stats[i].value = payload[0])
      }
    },
    setLabel: (state, label) => state.newLabel = label,
  },
  actions: {
    addStats: ({commit}) => commit('addStats'),
    removeStat: ({commit}, stat) => commit('removeStat', stat),
    changeStat: ({commit}, payload) => commit('changeStat', payload),
    setLabel: ({commit}, label) => commit('setLabel', label),
  }
});


Vue.component('polygraph', {
  computed: {
    ...Vuex.mapState({
      stats: state => state.stats,
      getValue: state => state.valueToPoint
    }),
    ...{
      points: function() {
        let total = this.stats.length;
        return this.stats.map((stat, i) => {
          let point = this.getValue(stat.value, total, i);
          return point.x + ',' + point.y;
          }).join(' ');
      }
    }
  },
  components: {
    'axis-label': {
      props: {
        stat: Object,
        index: Number,
        total: Number
      },
      computed: {
        ...Vuex.mapState({
          getValue: state => state.valueToPoint
        }),
        ...{
          point() {
            return this.getValue(+this.stat.value+10, this.total, this.index);
          }
        }
      },
      template: `
      <text :x="point.x" :y="point.y">
        {{stat.label}}
      </text>
      `
    }
  },
  template: `
  <g>
    <polygon :points="points" />
    <circle cx="100" cy="100" r="80" />
    <axis-label
      v-for="(stat, index) in stats"
      :stat="stat"
      :index="index"
      :total="stats.length" />
  </g>
  `
});


const svg = new Vue({
  el: '#app',
  store,
  computed: Vuex.mapState({
    newLabel: state => state.newLabel,
    stats: state => state.stats
  }),
  methods: {


    add: function(e) {
      e.preventDefault() || (this.newLabel && this.$store.dispatch('addStats'))
    },

    add: function(e) {
      e.preventDefault();
      if (!this.newLabel) {
        return;
      }
      this.$store.dispatch('addStats')
    },

    remove: function(stat) {
      this.stats.length > 3 && this.$store.dispatch('removeStat', stat) || alert("Can't delete more");
    },
    change: function(value, label) {
      this.$store.dispatch('changeStat', [value, label]);
    },
    setNewLabel: function(label) {
      this.$store.dispatch('setLabel', label);
    }
  },
  template: `
  <div id="app">
    <svg width="200" height="200">
      <polygraph :stats="stats" />
    </svg>

    <div v-for="stat in stats">
      <label>{{stat.label}}</label>
      <input type="range" :value="stat.value" min="0" max="100"
        @input="change($event.target.value, stat.label)" />
      <span>{{stat.value}}</span>
      <button @click="remove(stat)" class="remove">X</button>
    </div>
    <form id="add">
      <input name="newLabel" :value="newLabel" @change="setNewLabel($event.target.value)" />
      <button @click="add">Add a Stat</button>
    </form>
    <pre id="raw">{{ stats }}</pre>
  </div>
  `
});
