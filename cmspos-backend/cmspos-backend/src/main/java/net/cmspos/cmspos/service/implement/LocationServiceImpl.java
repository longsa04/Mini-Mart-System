package net.cmspos.cmspos.service.implement;

import net.cmspos.cmspos.exception.ResourceNotFoundException;
import net.cmspos.cmspos.model.dto.LocationDto;
import net.cmspos.cmspos.model.entity.Location;
import net.cmspos.cmspos.repository.LocationRepository;
import net.cmspos.cmspos.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LocationServiceImpl implements LocationService {

    @Autowired
    private LocationRepository locationRepository;

    @Override
    public List<Location> getAllLocation() {
        return locationRepository.findAll();
    }

    @Override
    public Location createLocation(LocationDto locationDto) {

        Location location = new Location();
        location.setName(locationDto.getName());
        location.setAddress(locationDto.getAddress());

        return locationRepository.save(location);
    }

    @Override
    public Location getLocationById(Long id) {
        return locationRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Location not found with id: " + id));
    }

    @Override
    public Location updateLocation(Long id, LocationDto locationDto) {

        Location existingLocation = locationRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Location not found with id: " + id));

        if(existingLocation != null){
            existingLocation.setName(locationDto.getName());
            existingLocation.setAddress(locationDto.getAddress());

            return locationRepository.save(existingLocation);
        }else{
            return null;
        }
    }

    @Override
    public Location deleteLocation(Long id) {

        Location location = locationRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Location not found with id: " + id));
        if(location != null){
            locationRepository.delete(location);
            return location;
        }else{
            return null;
        }


    }
}
