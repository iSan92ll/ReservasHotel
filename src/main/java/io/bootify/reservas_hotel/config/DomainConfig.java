package io.bootify.reservas_hotel.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;


@Configuration
@EntityScan("io.bootify.reservas_hotel.domain")
@EnableJpaRepositories("io.bootify.reservas_hotel.repos")
@EnableTransactionManagement
public class DomainConfig {
}
