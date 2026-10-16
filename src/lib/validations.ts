import { z } from 'zod';

/**
 * Sanitizes phone numbers by stripping non-numeric characters
 * and normalizing Indian country codes (+91 or leading 0).
 */
export const sanitizePhoneNumber = (val: string): string => {
  let cleaned = String(val || '').replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }
  return cleaned;
};

/**
 * Validates a normalized 10-digit mobile number.
 */
export const phoneSchema = z
  .string()
  .trim()
  .transform(sanitizePhoneNumber)
  .refine(val => val.length === 10, {
    message: 'Valid 10-digit mobile number is required',
  });

/**
 * Helper to format Zod errors into a clean, human-readable summary.
 */
export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map(i => {
      const field = i.path.join('.') || 'body';
      return `${field}: ${i.message}`;
    })
    .join(', ');
}

/**
 * Product creation schema with strict key enforcement.
 */
export const createProductSchema = z
  .object({
    name: z.string().trim().min(1, 'Product name is required').max(200, 'Product name too long'),
    category: z.string().trim().min(1, 'Category is required').max(100),
    price: z
      .coerce
      .number()
      .positive('Price must be greater than 0'),
    stock: z
      .coerce
      .number()
      .int('Stock must be an integer')
      .min(0, 'Stock cannot be negative'),
    description: z.string().trim().max(2000).nullable().optional(),
    unit: z.string().trim().max(50).optional().default('per unit'),
    imageUrl: z.string().trim().max(1000).nullable().optional(),
  })
  .strict();

/**
 * Product update schema with strict key enforcement.
 */
export const updateProductSchema = z
  .object({
    name: z.string().trim().min(1, 'Product name cannot be empty').max(200).optional(),
    category: z.string().trim().min(1).max(100).optional(),
    price: z
      .coerce
      .number()
      .positive('Price must be greater than 0')
      .optional(),
    stock: z
      .coerce
      .number()
      .int('Stock must be an integer')
      .min(0, 'Stock cannot be negative')
      .optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    unit: z.string().trim().max(50).optional(),
    imageUrl: z.string().trim().max(1000).nullable().optional(),
  })
  .strict();

/**
 * Machinery registration schema.
 */
export const createMachinerySchema = z
  .object({
    title: z.string().trim().max(200).optional(),
    model: z.string().trim().max(200).optional(),
    machineType: z.string().trim().min(1, 'Machine type is required').max(100),
    equipmentType: z.string().trim().max(100).optional(),
    ratePerHour: z
      .coerce
      .number()
      .positive('Rate per hour must be greater than 0'),
    district: z.string().trim().min(1, 'District is required').max(100),
    state: z.string().trim().min(1, 'State is required').max(100).default('Uttar Pradesh'),
    contactPhone: z.string().trim().max(20).optional(),
    phone: z.string().trim().max(20).optional(),
    chcName: z.string().trim().max(100).optional(),
    available: z.boolean().optional().default(true),
    ownerId: z.string().optional(),
    firebaseUid: z.string().optional(),
  })
  .refine(
    data => Boolean(data.title?.trim() || data.model?.trim() || data.machineType?.trim()),
    {
      message: 'Machine title, model, or type is required',
      path: ['title'],
    }
  );

/**
 * Labour post creation schema.
 */
export const createLabourPostSchema = z
  .object({
    leaderName: z.string().trim().max(100).optional(),
    teamLeaderName: z.string().trim().max(100).optional(),
    taskType: z.string().trim().max(200).optional(),
    primarySkill: z.string().trim().max(200).optional(),
    specialization: z.string().trim().max(200).optional(),
    groupSize: z
      .coerce
      .number()
      .int('Group size must be an integer')
      .min(1, 'Group size must be at least 1')
      .max(500, 'Group size cannot exceed 500')
      .optional(),
    teamSize: z
      .coerce
      .number()
      .int('Team size must be an integer')
      .min(1)
      .max(500)
      .optional(),
    wagePerDay: z
      .coerce
      .number()
      .positive('Daily wage must be greater than 0')
      .optional(),
    dailyRatePerWorker: z
      .coerce
      .number()
      .positive()
      .optional(),
    district: z.string().trim().min(1, 'District is required').max(100),
    phone: z.string().trim().max(20).optional(),
    contactPhone: z.string().trim().max(20).optional(),
    available: z.boolean().optional().default(true),
    userId: z.string().optional(),
    leaderId: z.string().optional(),
    firebaseUid: z.string().optional(),
  })
  .refine(
    data => Boolean(data.taskType?.trim() || data.primarySkill?.trim() || data.specialization?.trim()),
    {
      message: 'Task type or primary skill is required',
      path: ['taskType'],
    }
  )
  .refine(
    data => data.groupSize !== undefined || data.teamSize !== undefined,
    {
      message: 'Group size is required',
      path: ['groupSize'],
    }
  )
  .refine(
    data => data.wagePerDay !== undefined || data.dailyRatePerWorker !== undefined,
    {
      message: 'Daily wage rate is required',
      path: ['wagePerDay'],
    }
  );

/**
 * Order item schema.
 */
export const orderItemSchema = z.object({
  productId: z.string().trim().min(1, 'Product ID is required'),
  quantity: z
    .coerce
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(1000, 'Quantity cannot exceed 1000'),
});

/**
 * Order creation schema with 10-digit phone and delivery address validation.
 */
export const createOrderSchema = z.object({
  customerName: z.string().trim().min(1, 'Customer name is required').max(100),
  customerPhone: phoneSchema,
  shippingAddress: z.string().trim().min(1, 'Shipping address is required').max(500),
  district: z.string().trim().max(100).optional(),
  pincode: z.string().trim().max(20).optional(),
  paymentMethod: z.string().trim().max(100).optional().default('Cash on Delivery (COD)'),
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
});

/**
 * Seller registration schema.
 */
export const registerSellerSchema = z.object({
  storeName: z.string().trim().min(1, 'Store name is required').max(100),
  ownerName: z.string().trim().min(1, 'Owner name is required').max(100),
  phone: phoneSchema,
  district: z.string().trim().min(1, 'District is required').max(100),
  category: z.string().trim().min(1, 'Category is required').max(100),
  shopAddress: z.string().trim().max(300).optional(),
  licenseOrGstin: z.string().trim().max(100).optional(),
});
