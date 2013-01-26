(function () {
  'use strict';

  var $ = window.jQuery;
  var _ = window._;
  var app = window.app;

  app.RepoFilterItemView = app.View.extend({
    template: _.template($('#js-repo-filter-item-template').html()),
    className: 'li',
    events: {
      'change input': 'applyFilter',
      'click .js-refresh': 'refresh',
      'click .js-remove': 'remove'
    },

    applyFilter: function () {
      var checked = this.$('input').is(':checked');
      app.board.filteredIssues[checked ? 'add' : 'remove'](this.model.issues);
    },

    initialize: function () {
      this.listenTo(this.model, {
        request: this.onRequest,
        sync: this.onSync,
        error: this.onError
      });
      this.listenTo(this.model.issues, {
        request: this.onRequest,
        sync: this.onSync,
        error: this.onError
      });
    },

    onRequest: function () {
      this.$el
        .attr('title', 'Refreshing this repo...')
        .removeClass('js-success js-error').addClass('js-pending');
    },

    onSync: function () {
      this.$el
        .attr('title', 'Repo refreshed successfully!')
        .removeClass('js-pending js-error').addClass('js-pending');
      this.clearStatus(5000);
    },

    onError: function (__, xhr) {
      this.$el
        .attr('title', xhr.status + ' Error: ' + xhr.data.message)
        .removeClass('js-pending js-success').addClass('js-error');
      this.clearStatus(10000);
    },

    clearStatus: function (wait) {
      clearTimeout(this.statusTimeout);
      var self = this;
      _.delay(function () {
        self.$el
          .removeAttr('title')
          .removeClass('js-pending js-success js-error');
      }, wait);
    },

    refresh: function () {
      this.model.fetch({
        remote: true,
        success: function (repo) {
          repo.issues.fetch({remote: true, update: true});
        }
      });
    },

    remove: function () {
      app.board.repos.remove(this.model);
      app.View.prototype.remove.apply(this);
    },

    render: function () {
      this.$el.html(this.template({repo: this.model}));
      return this;
    }
  });
})();
