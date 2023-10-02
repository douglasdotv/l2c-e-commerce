package br.com.dv.ecommerce.dao;

import br.com.dv.ecommerce.entity.State;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@CrossOrigin("http://localhost:4200")
public interface StateRepository extends JpaRepository<State, Long> {

    List<State> findByCountryCode(String code);

}
