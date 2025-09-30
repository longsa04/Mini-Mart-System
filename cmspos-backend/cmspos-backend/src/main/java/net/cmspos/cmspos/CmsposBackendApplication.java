package net.cmspos.cmspos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"net.cmspos.cmspos"})
public class CmsposBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(CmsposBackendApplication.class, args);
	}

}
