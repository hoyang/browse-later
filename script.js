var app = new Vue({
    el: '#container',
    data: {
        tabs: []
    },
    created() {
        document.addEventListener('DOMContentLoaded', this.getTabsList);
    },
    beforeDestory() {
        document.removeEventListener('DOMContentLoaded', this.getTabsList);
    },
    methods: {
        getTabsList() {
            const vm = this;
            getAllSavesTabs().then((tabs) => {
                vm.tabs = tabs;
            }).catch((error) => {
                console.log(error);
            });
        },
        getFavicon: function (favicon) {
            const Default = 'icons/icon.png';
            let fav = '';
            if (favicon === undefined) {
                fav = Default;
            } else {
                fav = favicon;
            }
            return {
                'background-image': 'url(' + fav + ')'
            };
        },
        openTab(e) {
            openTab(e);
        },
        removeTab(e) {
            removeTab(e);
        },
        copyTab(e) {
            copyTab(e);
        },
        openAllTabs(e) {
            openAllTabs(e);
        },
        copyAllTabs(e) {
            copyAllTabs(e);
        },
        cleanupAllTabs(e) {
            cleanupAllTabs(e);
        }
    }
})