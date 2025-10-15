package io.bootify.reservas_hotel.service;

import io.bootify.reservas_hotel.domain.Usuario;
import io.bootify.reservas_hotel.events.BeforeDeleteUsuario;
import io.bootify.reservas_hotel.model.UsuarioDTO;
import io.bootify.reservas_hotel.repos.UsuarioRepository;
import io.bootify.reservas_hotel.util.NotFoundException;
import java.util.List;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final ApplicationEventPublisher publisher;

    public UsuarioService(final UsuarioRepository usuarioRepository,
            final ApplicationEventPublisher publisher) {
        this.usuarioRepository = usuarioRepository;
        this.publisher = publisher;
    }

    public List<UsuarioDTO> findAll() {
        final List<Usuario> usuarios = usuarioRepository.findAll(Sort.by("idUsuario"));
        return usuarios.stream()
                .map(usuario -> mapToDTO(usuario, new UsuarioDTO()))
                .toList();
    }

    public UsuarioDTO get(final Long idUsuario) {
        return usuarioRepository.findById(idUsuario)
                .map(usuario -> mapToDTO(usuario, new UsuarioDTO()))
                .orElseThrow(NotFoundException::new);
    }

    public Long create(final UsuarioDTO usuarioDTO) {
        final Usuario usuario = new Usuario();
        mapToEntity(usuarioDTO, usuario);
        return usuarioRepository.save(usuario).getIdUsuario();
    }

    public void update(final Long idUsuario, final UsuarioDTO usuarioDTO) {
        final Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(NotFoundException::new);
        mapToEntity(usuarioDTO, usuario);
        usuarioRepository.save(usuario);
    }

    public void delete(final Long idUsuario) {
        final Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(NotFoundException::new);
        publisher.publishEvent(new BeforeDeleteUsuario(idUsuario));
        usuarioRepository.delete(usuario);
    }

    private UsuarioDTO mapToDTO(final Usuario usuario, final UsuarioDTO usuarioDTO) {
        usuarioDTO.setIdUsuario(usuario.getIdUsuario());
        usuarioDTO.setNombreUsuario(usuario.getNombreUsuario());
        usuarioDTO.setApellidoUsuario(usuario.getApellidoUsuario());
        usuarioDTO.setNumeroUsuario(usuario.getNumeroUsuario());
        usuarioDTO.setEmailUsuario(usuario.getEmailUsuario());
        usuarioDTO.setRolUsuario(usuario.getRolUsuario());
        usuarioDTO.setContraUsuario(usuario.getContraUsuario());
        return usuarioDTO;
    }

    private Usuario mapToEntity(final UsuarioDTO usuarioDTO, final Usuario usuario) {
        usuario.setNombreUsuario(usuarioDTO.getNombreUsuario());
        usuario.setApellidoUsuario(usuarioDTO.getApellidoUsuario());
        usuario.setNumeroUsuario(usuarioDTO.getNumeroUsuario());
        usuario.setEmailUsuario(usuarioDTO.getEmailUsuario());
        usuario.setRolUsuario(usuarioDTO.getRolUsuario());
        usuario.setContraUsuario(usuarioDTO.getContraUsuario());
        return usuario;
    }

    public boolean emailUsuarioExists(final String emailUsuario) {
        return usuarioRepository.existsByEmailUsuarioIgnoreCase(emailUsuario);
    }

}
