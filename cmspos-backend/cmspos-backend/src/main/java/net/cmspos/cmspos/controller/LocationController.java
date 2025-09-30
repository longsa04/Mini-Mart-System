package net.cmspos.cmspos.controller;

import net.cmspos.cmspos.model.dto.LocationDto;
import net.cmspos.cmspos.model.entity.Location;
import net.cmspos.cmspos.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class LocationController {

    @Autowired
    private LocationService locationService;

    @GetMapping("/locations")
    public List<Location> getAllLocation(){
        return locationService.getAllLocation();
    }

    @PostMapping("/locations")
    public ResponseEntity<Location> createLocation(@RequestBody LocationDto locationDto){
        try{
            return ResponseEntity.status(200).body(locationService.createLocation(locationDto));
        }catch (Exception e){
            return ResponseEntity.status(400).body(null);
        }
    }


    @GetMapping("/locations/{id}")
    public ResponseEntity<Location> getLocationById(@PathVariable Long id){

        Location location = locationService.getLocationById(id);
        if(location != null){
            return ResponseEntity.status(HttpStatus.OK).body(location);
        }else{
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }


    @PutMapping("/locations/{id}")
    public Location updateLocation(@PathVariable Long id, @RequestBody LocationDto locationDto){
        return locationService.updateLocation(id, locationDto);
    }


    @DeleteMapping("/locations/{id}")
    public Location deleteLocation(Long id){
        return locationService.deleteLocation(id);
    }


}
