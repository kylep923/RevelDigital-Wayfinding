/* [GENERATED] Basic scripting template for the Android platform */
import java.util.List;
import java.util.Iterator;
import android.view.*;
import android.animation.*;
import android.widget.*;
import android.os.*;
import android.util.Log;
import com.reveldigital.player.api.*;
import com.reveldigital.player.*;

com.reveldigital.player.json.Module m = new com.reveldigital.player.json.Module();
m.left = 0;
m.top = 0;
m.width = 1080;
m.height = 1920;
m.sequence = 0;
m.type = "ComboView";

ComboView Home_Combo;
ComboView Events_Combo;
ComboView Attractions_Combo;
ComboView About_Combo;
boolean attractActive = false;
Handler handler = new Handler();

boolean MapGadgetReady = false;
boolean MapDirectoryReady = false;
String places = "";
String directions = "";

final Runnable timeout = new Runnable() {
    void run() {
        showAttract();
        MapGadget.executeJavascript("removeLastPath()");
    }
};

/* [GENERATED] The listener interface for receiving template events */
Controller.addTemplateListener(new TemplateListener() {
    onInitialized() { /* Triggered when the template is created */

        Controller.getTemplate().removeView(Home_1);
        Controller.getTemplate().removeView(Home_2);
        Controller.getTemplate().removeView(About_1);
        Controller.getTemplate().removeView(About_2);
        Controller.getTemplate().removeView(Events_1);
        Controller.getTemplate().removeView(Events_2);
        Controller.getTemplate().removeView(Events_3);
        Controller.getTemplate().removeView(Events_4);
        Controller.getTemplate().removeView(Attractions_1);
        Controller.getTemplate().removeView(Attractions_2);

        Home_Combo = new ComboView(Controller, m);
        Home_Combo.addView(Home_1);
        Home_Combo.addView(Home_2);

        Events_Combo = new ComboView(Controller, m);
        Events_Combo.addView(Events_1);
        Events_Combo.addView(Events_2);
        Events_Combo.addView(Events_3);
        Events_Combo.addView(Events_4);

        Attractions_Combo = new ComboView(Controller, m);
        Attractions_Combo.addView(Attractions_1);
        Attractions_Combo.addView(Attractions_2);

        About_Combo = new ComboView(Controller, m);
        About_Combo.addView(About_1);
        About_Combo.addView(About_2);

        Events_2.setShowCarets(true);
        Events_4.setShowCarets(true);
        About_1.setShowCarets(true);
        About_2.setShowCarets(true);

        AbsoluteLayout.LayoutParams params = new AbsoluteLayout.LayoutParams(1080, 1800, 0, 0);
        Controller.getTemplate().addView(Home_Combo, params);
        Controller.getTemplate().addView(About_Combo, params);
        Controller.getTemplate().addView(Events_Combo, params);
        Controller.getTemplate().addView(Attractions_Combo, params);
        
        hidePages();

    }
    onSuspended() { /* Triggered when the template is stopped */
    }
    onResumed() { /* Triggered when the template resumes playing */
    }
    onTerminated() { /* Triggered when the template is destroyed */
    }
    onClicked() { /* Global click handler for entire template */
        handler.removeCallbacks(timeout);
        handler.postDelayed(timeout, 60 * 1000 * 2);
    }
});

void addPlaces(){
    if (MapGadgetReady == true && MapDirectoryReady == true){
	    MapButtonGadget.executeJavascript("addPlaces("+ places +")");
    }
}

MapButtonGadget.addOnCallbackListener(new OnCallbackListener() {
    onCallback(String[] args) {
        Log.d("DEBUG","IN CALLBACK!");
        if(args.length > 0) {
            try {
                if(args[0].equals("ready")){
                    Log.d("DEBUG",args[0]);
                    MapDirectoryReady = true;
                    addPlaces();
                }else{
                    Log.d("DEBUG2",args[0]);
                    MapGadget.executeJavascript("generatePath(\"" + args[0] + "\")");
                }
            } catch(ex) {
                 Log.d("ERROR",ex);
            }
        }else{
            Log.d("DEBUG","Args length = 0!");
        }
    }
});

MapGadget.addOnCallbackListener(new OnCallbackListener() {
    onCallback(String[] args) {
        Log.d("DEBUG","IN CALLBACK!");
        if(args.length > 0) {
            try {
                Log.d("DEBUG",args[0]);
                MapGadgetReady = true;
                if(places.equals("")){
                    places = args[0];
                    addPlaces();
                }else{
                    directions = args[0];
                    MapButtonGadget.executeJavascript("directions(" + directions + ")");
                }
            } catch(ex) {
                Log.d("ERROR",ex);
            }
        }else{
            Log.d("DEBUG","Args length = 0!");
        }
    }
});


/* Resets Nav Bar to no selection */
/* ----------------------------------------------------------------- */
void resetNav(){
    /* Reset Nav Bar Background Color */
    NavMap.setVisibility(View.VISIBLE);
    NavEvents.setVisibility(View.VISIBLE);
    NavAttractions.setVisibility(View.VISIBLE);
    NavAbout.setVisibility(View.VISIBLE);
    NavHome.setVisibility(View.VISIBLE);

    /* Reset Nav Bar Text */
    HomeText.setVisibility(View.VISIBLE);
    MapText.setVisibility(View.VISIBLE);
    EventText.setVisibility(View.VISIBLE);
    AttractionsText.setVisibility(View.VISIBLE);
    AboutText.setVisibility(View.VISIBLE);
    
    /* Reset Nav Bar Selected Text */
    HomeTextSelected.setVisibility(View.VISIBLE);
    MapTextSelected.setVisibility(View.VISIBLE);
    EventsTextSelected.setVisibility(View.VISIBLE);
    AttractionsTextSelected.setVisibility(View.VISIBLE);
    AboutTextSelected.setVisibility(View.VISIBLE);
    NavSelected.setVisibility(View.VISIBLE);
}

/* Hides Whole Nav Bar*/
/* ----------------------------------------------------------------- */
void hideNav(){
    /* Hide Nav Bar Background Color */
    NavMap.setVisibility(View.GONE);
    NavEvents.setVisibility(View.GONE);
    NavAttractions.setVisibility(View.GONE);
    NavAbout.setVisibility(View.GONE);
    NavHome.setVisibility(View.GONE);

    /* Hide Nav Bar Text */
    HomeText.setVisibility(View.GONE);
    MapText.setVisibility(View.GONE);
    EventText.setVisibility(View.GONE);
    AttractionsText.setVisibility(View.GONE);
    AboutText.setVisibility(View.GONE);
    
    /* Hide Selected Nav Bar Text & Background */
    HomeTextSelected.setVisibility(View.GONE);
    MapTextSelected.setVisibility(View.GONE);
    EventsTextSelected.setVisibility(View.GONE);
    AttractionsTextSelected.setVisibility(View.GONE);
    AboutTextSelected.setVisibility(View.GONE);
    NavSelected.setVisibility(View.GONE);
}


/* Show and Hide Content */
/* ----------------------------------------------------------------- */
/* Show Home Page and Hide all other content */
void showHome(){
    Home_Combo.animate().x(0);
    MapCard.animate().x(50);
    MapCard.bringToFront();
    HoursCard.animate().x(590);
    HoursCard.bringToFront();
    AgeGenderCard.animate().x(50);
    AgeGenderCard.bringToFront();
    RevelCard.animate().x(590);
    RevelCard.bringToFront();
    HomeHotspot1.animate().x(0);
    HomeHotspot1.bringToFront();
    HomeHotspot2.animate().x(540);
    HomeHotspot2.bringToFront();
    HomeHotspot3.animate().x(0);
    HomeHotspot3.bringToFront();
    HomeHotspot4.animate().x(540);
    HomeHotspot4.bringToFront();
}
/* Show Map Page and Hide all other content */
void showMap(){
    /* [GENERATED] Make MapGadget visible */
    MapShape1.setVisibility(View.VISIBLE);
    MapShape2.setVisibility(View.VISIBLE);
    MapShape3.setVisibility(View.VISIBLE);
    MapHeaderSlideshow.animate().x(270);
    MapHeaderBanner.animate().x(0);
    MapButtonGadget.animate().x(0);
    MapGadget.animate().x(0);
}
/* Show Events Page and Hide all other content */
void showEvents(){
    /* [GENERATED] Make EventsSlideshow visible */
    Events_Combo.animate().x(0);
}

/* Show Attractions Page and Hide all other content */
void showAttractions(){
    /* [GENERATED] Make AttractionsImage visible */
    Attractions_Combo.animate().x(0);
}
/* Show About Page and Hide all other content */
void showAbout(){
    /* [GENERATED] Make AboutSlideshow visible */
    About_Combo.animate().x(0);
}

/* Hide all pages */
void hidePages(){
    /* Hide all Home page content */
    Home_Combo.animate().x(1080);
    MapCard.animate().x(1080);
    HoursCard.animate().x(1080);
    AgeGenderCard.animate().x(1080);
    RevelCard.animate().x(1080);
    RevelPage.animate().x(1080);
    PopupBackground.setVisibility(View.GONE);
    HomeHotspot1.animate().x(1080);
    HomeHotspot2.animate().x(1080);
    HomeHotspot3.animate().x(1080);
    HomeHotspot4.animate().x(1080);
    /* Hide all Events page content */
    Events_Combo.animate().x(1080);
    /* Hide all Attractions page content */
    Attractions_Combo.animate().x(1080);
    /* Hide all About page content */
    About_Combo.animate().x(1080);
    /* Hide all Map page content */
    MapShape1.setVisibility(View.GONE);
    MapShape2.setVisibility(View.GONE);
    MapShape3.setVisibility(View.GONE);
    MapHeaderSlideshow.animate().x(1080);
    MapHeaderBanner.animate().x(1080);
    MapButtonGadget.animate().x(1080);
    MapGadget.animate().x(1080);
}

/* Attract content */
/* ----------------------------------------------------------------- */
/* Hiding attract content */
void hideAttract(){
    AttractShape1.setVisibility(View.GONE);
    AttractShape2.setVisibility(View.GONE);
    AttractShape3.setVisibility(View.GONE);
    AttractShape4.setVisibility(View.GONE);
    AttractShape5.setVisibility(View.GONE);
    AttractVideo.setVisibility(View.GONE);
    AttractVideo.stop();
    AttractText.setVisibility(View.GONE);
    AttractBtnBanner.setVisibility(View.GONE);
    AttractWelcomeVideo.setVisibility(View.GONE);
    AttractWelcomeVideo.stop();
    AttractBottomLogo.setVisibility(View.GONE);
    AttractBottomBanner.setVisibility(View.GONE);
    AttractHotSpot.setVisibility(View.GONE);
    AttractTextBackground.setVisibility(View.GONE);
    
}
/* Hiding attract content */
void showAttract(){
    AttractShape1.setVisibility(View.VISIBLE);
    AttractShape2.setVisibility(View.VISIBLE);
    AttractShape3.setVisibility(View.VISIBLE);
    AttractShape4.setVisibility(View.VISIBLE);
    AttractShape5.setVisibility(View.VISIBLE);
    AttractVideo.setVisibility(View.VISIBLE);
    AttractVideo.start();
    AttractText.setVisibility(View.VISIBLE);
    AttractBtnBanner.setVisibility(View.VISIBLE);
    AttractWelcomeVideo.setVisibility(View.VISIBLE);
    AttractWelcomeVideo.start();
    AttractBottomLogo.setVisibility(View.VISIBLE);
    AttractBottomBanner.setVisibility(View.VISIBLE);
    AttractHotSpot.setVisibility(View.VISIBLE);
    AttractTextBackground.setVisibility(View.VISIBLE);
    hidePages();
}
/* Attract onClick listeners */
/* [GENERATED] Click handler for AttractHotSpot */
AttractHotSpot.setOnClickListener(new View.OnClickListener() {
    onClick(View v) {
        hideAttract();
        resetNav();
        hidePages();
        NavHome.setVisibility(View.GONE);
        HomeText.setVisibility(View.GONE);
        hideAttract();
        showHome();
    }
});


/* Nav Bar OnClick Listeners */
/* ----------------------------------------------------------------- */
HomeHotSpot.setOnClickListener(new View.OnClickListener() {
    onClick(View v) {
        resetNav();
        hidePages();
        NavHome.setVisibility(View.GONE);
        HomeText.setVisibility(View.GONE);
        hideAttract();
        showHome();
    }
});
MapHotSpot.setOnClickListener(new View.OnClickListener() {
    onClick(View v) {
        resetNav();
        hidePages();
        NavMap.setVisibility(View.GONE);
        MapText.setVisibility(View.GONE);
        hideAttract();
        showMap();
    }
});
EventHotSpot.setOnClickListener(new View.OnClickListener() {
    onClick(View v) {
        resetNav();
        hidePages();
        NavEvents.setVisibility(View.GONE);
        EventText.setVisibility(View.GONE);
        hideAttract();
        showEvents();
    }
});
AttractionsHotSpot.setOnClickListener(new View.OnClickListener() {
    onClick(View v) {
        resetNav();
        hidePages();
        NavAttractions.setVisibility(View.GONE);
        AttractionsText.setVisibility(View.GONE);
        hideAttract();
        showAttractions();
    }
});
AboutHotSpot.setOnClickListener(new View.OnClickListener() {
    onClick(View v) {
        resetNav();
        hidePages();
        NavAbout.setVisibility(View.GONE);
        AboutText.setVisibility(View.GONE);
        hideAttract();
        showAbout();
    }
});

/* Home Page OnClick Listeners */
/* ----------------------------------------------------------------- */

HomeHotspot1.setOnClickListener(new View.OnClickListener() {
    onClick(View v) {
        resetNav();
        hidePages();
        NavMap.setVisibility(View.GONE);
        MapText.setVisibility(View.GONE);
        hideAttract();
        showMap();
    }
});
HomeHotspot2.setOnClickListener(new View.OnClickListener() {
    onClick(View v) {
        resetNav();
        hidePages();
        NavAbout.setVisibility(View.GONE);
        AboutText.setVisibility(View.GONE);
        hideAttract();
        showAbout();
    }
});
/* [GENERATED] Click handler for HomeHotspot4 */
HomeHotspot4.setOnClickListener(new View.OnClickListener() {
    onClick(View v) {
        PopupBackground.setVisibility(View.VISIBLE);
        PopupBackground.bringToFront();
        RevelPage.animate().x(100);
        RevelPage.bringToFront();
    }
});
/* [GENERATED] Click handler for PopupBackground */
PopupBackground.setOnClickListener(new View.OnClickListener() {
    onClick(View v) {
        PopupBackground.setVisibility(View.GONE);
        RevelPage.animate().x(1080);
    }
});




