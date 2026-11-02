import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const { email, usuario, password, ...rest } = createUserDto;

    const existingEmail = await this.userRepository.findOne({ where: { email } });
    if (existingEmail) {
      throw new ConflictException(`El correo electrónico ${email} ya está registrado`);
    }

    const existingUsername = await this.userRepository.findOne({ where: { usuario } });
    if (existingUsername) {
      throw new ConflictException(`El nombre de usuario '${usuario}' ya está en uso`);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = this.userRepository.create({
      ...rest,
      email,
      usuario,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    const { password: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as Omit<User, 'password'>;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        usuario: true,
        password: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (emailExists) {
        throw new ConflictException(`El correo ${updateUserDto.email} ya está en uso`);
      }
    }

    if (updateUserDto.usuario && updateUserDto.usuario !== user.usuario) {
      const userExists = await this.userRepository.findOne({
        where: { usuario: updateUserDto.usuario },
      });
      if (userExists) {
        throw new ConflictException(`El nombre de usuario '${updateUserDto.usuario}' ya está en uso`);
      }
    }

    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    const userToUpdate = await this.userRepository.preload({
      id,
      ...updateUserDto,
    });

    if (!userToUpdate) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const savedUser = await this.userRepository.save(userToUpdate);
    const { password: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as Omit<User, 'password'>;
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return { message: `Usuario con ID ${id} eliminado exitosamente` };
  }
}
