/**
 * The control panel.
 */
var Panel = {
    init: function() {
        var $algo = $('#algorithm_panel');
        var $play= $('#play_panel');

        $('.panel').draggable();
           
        $('#store_panel').css({
            top: $play.offset().top + $play.outerHeight() +350
        });

        $('#play_panel').css({
            top: $algo.offset().top + $algo.outerHeight() + 20
        });
        $('#button2').attr('disabled', 'disabled');
    },
    /**
     * Get the user selected path-finder.
     * TODO: clean up this messy code.
     */
    getFinder: function() {
        var finder;
        
        finder = new PF.AStarFinder();
       
        return finder;
    }
};

