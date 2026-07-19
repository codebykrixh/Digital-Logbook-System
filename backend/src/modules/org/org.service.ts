import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';

/**
 * Resolve the plant a user operates in. Derived from their department when
 * set, otherwise falls back to the first plant — correct for the common
 * single-plant deployment and still sensible once multi-plant orgs exist.
 */
export const orgService = {
  async getContextForUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { department: { include: { plant: true } } },
    });
    if (!user) throw ApiError.notFound('User not found');

    const plant = user.department?.plant ?? (await prisma.plant.findFirst());
    if (!plant) throw ApiError.notFound('No plant has been configured yet');

    const [departments, machines, users] = await Promise.all([
      prisma.department.findMany({
        where: { plantId: plant.id },
        orderBy: { name: 'asc' },
      }),
      prisma.machine.findMany({
        where: { plantId: plant.id },
        orderBy: { name: 'asc' },
      }),
      prisma.user.findMany({
        where: {
          status: 'ACTIVE',
          OR: [{ department: { plantId: plant.id } }, { departmentId: null }],
        },
        orderBy: { firstName: 'asc' },
        select: { id: true, firstName: true, lastName: true, role: true, jobTitle: true },
        take: 200,
      }),
    ]);

    return {
      plant: { id: plant.id, name: plant.name, code: plant.code },
      departments: departments.map((d) => ({ id: d.id, name: d.name, code: d.code })),
      machines: machines.map((m) => ({ id: m.id, name: m.name, tag: m.tag, status: m.status })),
      users,
      myDepartmentId: user.departmentId,
    };
  },
};
