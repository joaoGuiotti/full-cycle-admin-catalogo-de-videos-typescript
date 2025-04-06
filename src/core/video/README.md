# 3 imagens (banner, thumbnail, thumbnail half)

# 2 video (trailer, video)

## DD

--- entidades ou objetos de negócio

video ou banner - checksum

## imagens

- name
- location

## videos

- name
- raw_location
- encoded_location
- status = [processing, completed]


## Audio videos
 - name
 - raw_location
 - encoded_location
 - status 

# Event Storming(Video)
Todos os listados abaixo são eventos, qualquer operação de negocio pode gerar um evento, representa algo no passado, sempre algo que ocorreu:

 - Video Criado
 - Upload Realizado (Banner)
 - Titulo Modificado

 OBS: Cuidado para não confundir com os eventos de ORM (Fatos de armezenamento)

 RECOMENDAÇÕES:
  leitura DDD do Vernon




