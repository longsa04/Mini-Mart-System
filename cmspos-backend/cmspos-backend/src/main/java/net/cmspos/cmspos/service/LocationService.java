package net.cmspos.cmspos.service;

import net.cmspos.cmspos.model.dto.LocationDto;
import net.cmspos.cmspos.model.entity.Location;
import org.springframework.stereotype.Service;

import java.util.List;

public interface LocationService {
    List<Location> getAllLocation();
    Location createLocation(LocationDto locationDto);
    Location getLocationById(Long id);
    Location updateLocation(Long id, LocationDto locationDto);
    Location deleteLocation(Long id);
}
