Component({
  data: {
    selected: 0
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({ url: url });
    },
    goPage(e) {
      const url = e.currentTarget.dataset.path;
      wx.navigateTo({ url: url });
    }
  }
});
