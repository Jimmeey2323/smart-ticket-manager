export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      businessHours: {
        Row: {
          closeTime: string
          createdAt: string | null
          dayOfWeek: number
          id: string
          isWorkingDay: boolean | null
          openTime: string
          studioId: string | null
          timeZone: string | null
          updatedAt: string | null
        }
        Insert: {
          closeTime: string
          createdAt?: string | null
          dayOfWeek: number
          id?: string
          isWorkingDay?: boolean | null
          openTime: string
          studioId?: string | null
          timeZone?: string | null
          updatedAt?: string | null
        }
        Update: {
          closeTime?: string
          createdAt?: string | null
          dayOfWeek?: number
          id?: string
          isWorkingDay?: boolean | null
          openTime?: string
          studioId?: string | null
          timeZone?: string | null
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businessHours_studioId_fkey"
            columns: ["studioId"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          code: string
          color: string | null
          createdAt: string | null
          defaultDepartmentId: string | null
          defaultPriority: string | null
          defaultTeamId: string | null
          description: string | null
          icon: string | null
          id: string
          isActive: boolean | null
          name: string
          slaHours: number | null
          sortOrder: number | null
          updatedAt: string | null
        }
        Insert: {
          code: string
          color?: string | null
          createdAt?: string | null
          defaultDepartmentId?: string | null
          defaultPriority?: string | null
          defaultTeamId?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          isActive?: boolean | null
          name: string
          slaHours?: number | null
          sortOrder?: number | null
          updatedAt?: string | null
        }
        Update: {
          code?: string
          color?: string | null
          createdAt?: string | null
          defaultDepartmentId?: string | null
          defaultPriority?: string | null
          defaultTeamId?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          isActive?: boolean | null
          name?: string
          slaHours?: number | null
          sortOrder?: number | null
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_defaultDepartmentId_fkey"
            columns: ["defaultDepartmentId"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_defaultTeamId_fkey"
            columns: ["defaultTeamId"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      customerFeedback: {
        Row: {
          createdAt: string | null
          customerEmail: string | null
          customerName: string | null
          feedback: string | null
          feedbackType: string | null
          followUpRequired: boolean | null
          id: string
          isPublic: boolean | null
          rating: number | null
          tags: string[] | null
          ticketId: string
        }
        Insert: {
          createdAt?: string | null
          customerEmail?: string | null
          customerName?: string | null
          feedback?: string | null
          feedbackType?: string | null
          followUpRequired?: boolean | null
          id?: string
          isPublic?: boolean | null
          rating?: number | null
          tags?: string[] | null
          ticketId: string
        }
        Update: {
          createdAt?: string | null
          customerEmail?: string | null
          customerName?: string | null
          feedback?: string | null
          feedbackType?: string | null
          followUpRequired?: boolean | null
          id?: string
          isPublic?: boolean | null
          rating?: number | null
          tags?: string[] | null
          ticketId?: string
        }
        Relationships: [
          {
            foreignKeyName: "customerFeedback_ticketId_fkey"
            columns: ["ticketId"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          createdAt: string | null
          description: string | null
          id: string
          isActive: boolean | null
          managerEmail: string | null
          name: string
          updatedAt: string | null
        }
        Insert: {
          code: string
          createdAt?: string | null
          description?: string | null
          id?: string
          isActive?: boolean | null
          managerEmail?: string | null
          name: string
          updatedAt?: string | null
        }
        Update: {
          code?: string
          createdAt?: string | null
          description?: string | null
          id?: string
          isActive?: boolean | null
          managerEmail?: string | null
          name?: string
          updatedAt?: string | null
        }
        Relationships: []
      }
      dynamicFields: {
        Row: {
          categoryId: string | null
          createdAt: string | null
          defaultValue: string | null
          description: string | null
          fieldTypeId: string
          id: string
          isActive: boolean | null
          isHidden: boolean | null
          isRequired: boolean | null
          label: string
          options: string[] | null
          sortOrder: number | null
          subcategoryId: string | null
          uniqueId: string
          updatedAt: string | null
          validationRules: Json | null
        }
        Insert: {
          categoryId?: string | null
          createdAt?: string | null
          defaultValue?: string | null
          description?: string | null
          fieldTypeId: string
          id?: string
          isActive?: boolean | null
          isHidden?: boolean | null
          isRequired?: boolean | null
          label: string
          options?: string[] | null
          sortOrder?: number | null
          subcategoryId?: string | null
          uniqueId: string
          updatedAt?: string | null
          validationRules?: Json | null
        }
        Update: {
          categoryId?: string | null
          createdAt?: string | null
          defaultValue?: string | null
          description?: string | null
          fieldTypeId?: string
          id?: string
          isActive?: boolean | null
          isHidden?: boolean | null
          isRequired?: boolean | null
          label?: string
          options?: string[] | null
          sortOrder?: number | null
          subcategoryId?: string | null
          uniqueId?: string
          updatedAt?: string | null
          validationRules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "dynamicFields_categoryId_fkey"
            columns: ["categoryId"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dynamicFields_fieldTypeId_fkey"
            columns: ["fieldTypeId"]
            isOneToOne: false
            referencedRelation: "fieldTypes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dynamicFields_subcategoryId_fkey"
            columns: ["subcategoryId"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      fieldTypes: {
        Row: {
          description: string | null
          id: string
          inputComponent: string
          isActive: boolean | null
          name: string
          validationRules: Json | null
        }
        Insert: {
          description?: string | null
          id?: string
          inputComponent: string
          isActive?: boolean | null
          name: string
          validationRules?: Json | null
        }
        Update: {
          description?: string | null
          id?: string
          inputComponent?: string
          isActive?: boolean | null
          name?: string
          validationRules?: Json | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actionLabel: string | null
          actionUrl: string | null
          category: string | null
          channels: string[] | null
          createdAt: string | null
          data: Json | null
          deliveredAt: string | null
          expiresAt: string | null
          id: string
          isRead: boolean | null
          message: string
          priority: string | null
          readAt: string | null
          relatedEntityId: string | null
          relatedEntityType: string | null
          relatedTicketId: string | null
          sentAt: string | null
          title: string
          type: string | null
          updatedAt: string | null
          userId: string
        }
        Insert: {
          actionLabel?: string | null
          actionUrl?: string | null
          category?: string | null
          channels?: string[] | null
          createdAt?: string | null
          data?: Json | null
          deliveredAt?: string | null
          expiresAt?: string | null
          id?: string
          isRead?: boolean | null
          message: string
          priority?: string | null
          readAt?: string | null
          relatedEntityId?: string | null
          relatedEntityType?: string | null
          relatedTicketId?: string | null
          sentAt?: string | null
          title: string
          type?: string | null
          updatedAt?: string | null
          userId: string
        }
        Update: {
          actionLabel?: string | null
          actionUrl?: string | null
          category?: string | null
          channels?: string[] | null
          createdAt?: string | null
          data?: Json | null
          deliveredAt?: string | null
          expiresAt?: string | null
          id?: string
          isRead?: boolean | null
          message?: string
          priority?: string | null
          readAt?: string | null
          relatedEntityId?: string | null
          relatedEntityType?: string | null
          relatedTicketId?: string | null
          sentAt?: string | null
          title?: string
          type?: string | null
          updatedAt?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_relatedTicketId_fkey"
            columns: ["relatedTicketId"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          expire: string
          sess: Json
          sid: string
        }
        Insert: {
          expire: string
          sess: Json
          sid: string
        }
        Update: {
          expire?: string
          sess?: Json
          sid?: string
        }
        Relationships: []
      }
      slaRules: {
        Row: {
          businessHoursOnly: boolean | null
          categoryId: string | null
          createdAt: string | null
          description: string | null
          escalationHours: number | null
          firstResponseHours: number | null
          id: string
          isActive: boolean | null
          name: string
          priority: string | null
          resolutionHours: number | null
          sortOrder: number | null
          studioId: string | null
          subcategoryId: string | null
          updatedAt: string | null
        }
        Insert: {
          businessHoursOnly?: boolean | null
          categoryId?: string | null
          createdAt?: string | null
          description?: string | null
          escalationHours?: number | null
          firstResponseHours?: number | null
          id?: string
          isActive?: boolean | null
          name: string
          priority?: string | null
          resolutionHours?: number | null
          sortOrder?: number | null
          studioId?: string | null
          subcategoryId?: string | null
          updatedAt?: string | null
        }
        Update: {
          businessHoursOnly?: boolean | null
          categoryId?: string | null
          createdAt?: string | null
          description?: string | null
          escalationHours?: number | null
          firstResponseHours?: number | null
          id?: string
          isActive?: boolean | null
          name?: string
          priority?: string | null
          resolutionHours?: number | null
          sortOrder?: number | null
          studioId?: string | null
          subcategoryId?: string | null
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "slaRules_categoryId_fkey"
            columns: ["categoryId"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slaRules_studioId_fkey"
            columns: ["studioId"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slaRules_subcategoryId_fkey"
            columns: ["subcategoryId"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      studios: {
        Row: {
          address: Json | null
          code: string
          createdAt: string | null
          email: string | null
          id: string
          isActive: boolean | null
          managerUserId: string | null
          name: string
          operatingHours: Json | null
          phone: string | null
          timeZone: string | null
          updatedAt: string | null
        }
        Insert: {
          address?: Json | null
          code: string
          createdAt?: string | null
          email?: string | null
          id?: string
          isActive?: boolean | null
          managerUserId?: string | null
          name: string
          operatingHours?: Json | null
          phone?: string | null
          timeZone?: string | null
          updatedAt?: string | null
        }
        Update: {
          address?: Json | null
          code?: string
          createdAt?: string | null
          email?: string | null
          id?: string
          isActive?: boolean | null
          managerUserId?: string | null
          name?: string
          operatingHours?: Json | null
          phone?: string | null
          timeZone?: string | null
          updatedAt?: string | null
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          categoryId: string
          code: string
          createdAt: string | null
          defaultPriority: string | null
          description: string | null
          id: string
          isActive: boolean | null
          name: string
          slaHours: number | null
          sortOrder: number | null
          updatedAt: string | null
        }
        Insert: {
          categoryId: string
          code: string
          createdAt?: string | null
          defaultPriority?: string | null
          description?: string | null
          id?: string
          isActive?: boolean | null
          name: string
          slaHours?: number | null
          sortOrder?: number | null
          updatedAt?: string | null
        }
        Update: {
          categoryId?: string
          code?: string
          createdAt?: string | null
          defaultPriority?: string | null
          description?: string | null
          id?: string
          isActive?: boolean | null
          name?: string
          slaHours?: number | null
          sortOrder?: number | null
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_categoryId_fkey"
            columns: ["categoryId"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          createdAt: string | null
          departmentId: string | null
          description: string | null
          id: string
          isActive: boolean | null
          leadUserId: string | null
          name: string
          updatedAt: string | null
        }
        Insert: {
          createdAt?: string | null
          departmentId?: string | null
          description?: string | null
          id?: string
          isActive?: boolean | null
          leadUserId?: string | null
          name: string
          updatedAt?: string | null
        }
        Update: {
          createdAt?: string | null
          departmentId?: string | null
          description?: string | null
          id?: string
          isActive?: boolean | null
          leadUserId?: string | null
          name?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_departmentId_fkey"
            columns: ["departmentId"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      ticketAttachments: {
        Row: {
          commentId: string | null
          createdAt: string | null
          fileName: string
          filePath: string
          fileSize: number | null
          id: string
          isPublic: boolean | null
          mimeType: string | null
          originalFileName: string
          ticketId: string
          uploadedByUserId: string
        }
        Insert: {
          commentId?: string | null
          createdAt?: string | null
          fileName: string
          filePath: string
          fileSize?: number | null
          id?: string
          isPublic?: boolean | null
          mimeType?: string | null
          originalFileName: string
          ticketId: string
          uploadedByUserId: string
        }
        Update: {
          commentId?: string | null
          createdAt?: string | null
          fileName?: string
          filePath?: string
          fileSize?: number | null
          id?: string
          isPublic?: boolean | null
          mimeType?: string | null
          originalFileName?: string
          ticketId?: string
          uploadedByUserId?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticketAttachments_commentId_fkey"
            columns: ["commentId"]
            isOneToOne: false
            referencedRelation: "ticketComments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticketAttachments_ticketId_fkey"
            columns: ["ticketId"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticketAttachments_uploadedByUserId_fkey"
            columns: ["uploadedByUserId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ticketComments: {
        Row: {
          attachments: Json | null
          commentType: string | null
          content: string
          createdAt: string | null
          id: string
          isInternal: boolean | null
          isResolution: boolean | null
          mentionedUserIds: string[] | null
          ticketId: string
          timeSpentMinutes: number | null
          updatedAt: string | null
          userId: string
        }
        Insert: {
          attachments?: Json | null
          commentType?: string | null
          content: string
          createdAt?: string | null
          id?: string
          isInternal?: boolean | null
          isResolution?: boolean | null
          mentionedUserIds?: string[] | null
          ticketId: string
          timeSpentMinutes?: number | null
          updatedAt?: string | null
          userId: string
        }
        Update: {
          attachments?: Json | null
          commentType?: string | null
          content?: string
          createdAt?: string | null
          id?: string
          isInternal?: boolean | null
          isResolution?: boolean | null
          mentionedUserIds?: string[] | null
          ticketId?: string
          timeSpentMinutes?: number | null
          updatedAt?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticketComments_ticketId_fkey"
            columns: ["ticketId"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticketComments_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ticketHistory: {
        Row: {
          action: string
          automatedChange: boolean | null
          changedByUserId: string | null
          changeReason: string | null
          createdAt: string | null
          fieldChanged: string | null
          id: string
          ipAddress: unknown
          newValue: Json | null
          oldValue: Json | null
          ticketId: string
          userAgent: string | null
        }
        Insert: {
          action: string
          automatedChange?: boolean | null
          changedByUserId?: string | null
          changeReason?: string | null
          createdAt?: string | null
          fieldChanged?: string | null
          id?: string
          ipAddress?: unknown
          newValue?: Json | null
          oldValue?: Json | null
          ticketId: string
          userAgent?: string | null
        }
        Update: {
          action?: string
          automatedChange?: boolean | null
          changedByUserId?: string | null
          changeReason?: string | null
          createdAt?: string | null
          fieldChanged?: string | null
          id?: string
          ipAddress?: unknown
          newValue?: Json | null
          oldValue?: Json | null
          ticketId?: string
          userAgent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticketHistory_changedByUserId_fkey"
            columns: ["changedByUserId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticketHistory_ticketId_fkey"
            columns: ["ticketId"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          actualResolutionTime: string | null
          assignedDepartmentId: string | null
          assignedTeamId: string | null
          assignedToUserId: string | null
          categoryId: string
          clientMood: string | null
          closedAt: string | null
          createdAt: string | null
          customerEmail: string | null
          customerMembershipId: string | null
          customerName: string | null
          customerPhone: string | null
          customerStatus: string | null
          description: string
          dynamicFieldData: Json | null
          escalatedAt: string | null
          estimatedResolutionTime: string | null
          firstResponseAt: string | null
          id: string
          incidentDateTime: string | null
          internalNotes: string | null
          isInternalTicket: boolean | null
          lastActivityAt: string | null
          parentTicketId: string | null
          priority: string | null
          reopenedAt: string | null
          reportedByUserId: string | null
          resolutionSummary: string | null
          resolvedAt: string | null
          satisfactionRating: number | null
          severity: string | null
          slaBreached: boolean | null
          slaDueAt: string | null
          source: string | null
          status: string | null
          studioId: string
          subcategoryId: string | null
          tags: string[] | null
          ticketNumber: string
          title: string
          updatedAt: string | null
        }
        Insert: {
          actualResolutionTime?: string | null
          assignedDepartmentId?: string | null
          assignedTeamId?: string | null
          assignedToUserId?: string | null
          categoryId: string
          clientMood?: string | null
          closedAt?: string | null
          createdAt?: string | null
          customerEmail?: string | null
          customerMembershipId?: string | null
          customerName?: string | null
          customerPhone?: string | null
          customerStatus?: string | null
          description: string
          dynamicFieldData?: Json | null
          escalatedAt?: string | null
          estimatedResolutionTime?: string | null
          firstResponseAt?: string | null
          id?: string
          incidentDateTime?: string | null
          internalNotes?: string | null
          isInternalTicket?: boolean | null
          lastActivityAt?: string | null
          parentTicketId?: string | null
          priority?: string | null
          reopenedAt?: string | null
          reportedByUserId?: string | null
          resolutionSummary?: string | null
          resolvedAt?: string | null
          satisfactionRating?: number | null
          severity?: string | null
          slaBreached?: boolean | null
          slaDueAt?: string | null
          source?: string | null
          status?: string | null
          studioId: string
          subcategoryId?: string | null
          tags?: string[] | null
          ticketNumber: string
          title: string
          updatedAt?: string | null
        }
        Update: {
          actualResolutionTime?: string | null
          assignedDepartmentId?: string | null
          assignedTeamId?: string | null
          assignedToUserId?: string | null
          categoryId?: string
          clientMood?: string | null
          closedAt?: string | null
          createdAt?: string | null
          customerEmail?: string | null
          customerMembershipId?: string | null
          customerName?: string | null
          customerPhone?: string | null
          customerStatus?: string | null
          description?: string
          dynamicFieldData?: Json | null
          escalatedAt?: string | null
          estimatedResolutionTime?: string | null
          firstResponseAt?: string | null
          id?: string
          incidentDateTime?: string | null
          internalNotes?: string | null
          isInternalTicket?: boolean | null
          lastActivityAt?: string | null
          parentTicketId?: string | null
          priority?: string | null
          reopenedAt?: string | null
          reportedByUserId?: string | null
          resolutionSummary?: string | null
          resolvedAt?: string | null
          satisfactionRating?: number | null
          severity?: string | null
          slaBreached?: boolean | null
          slaDueAt?: string | null
          source?: string | null
          status?: string | null
          studioId?: string
          subcategoryId?: string | null
          tags?: string[] | null
          ticketNumber?: string
          title?: string
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assignedDepartmentId_fkey"
            columns: ["assignedDepartmentId"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_assignedTeamId_fkey"
            columns: ["assignedTeamId"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_assignedToUserId_fkey"
            columns: ["assignedToUserId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_categoryId_fkey"
            columns: ["categoryId"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_parentTicketId_fkey"
            columns: ["parentTicketId"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_reportedByUserId_fkey"
            columns: ["reportedByUserId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_studioId_fkey"
            columns: ["studioId"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_subcategoryId_fkey"
            columns: ["subcategoryId"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      ticketWatchers: {
        Row: {
          addedByUserId: string | null
          createdAt: string | null
          id: string
          ticketId: string
          userId: string
          watchType: string | null
        }
        Insert: {
          addedByUserId?: string | null
          createdAt?: string | null
          id?: string
          ticketId: string
          userId: string
          watchType?: string | null
        }
        Update: {
          addedByUserId?: string | null
          createdAt?: string | null
          id?: string
          ticketId?: string
          userId?: string
          watchType?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticketWatchers_addedByUserId_fkey"
            columns: ["addedByUserId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticketWatchers_ticketId_fkey"
            columns: ["ticketId"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticketWatchers_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_studios: {
        Row: {
          created_at: string
          id: string
          role: string | null
          studio_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string | null
          studio_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string | null
          studio_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          createdAt: string | null
          departmentId: string | null
          displayName: string | null
          email: string | null
          firstName: string | null
          id: string
          isActive: boolean | null
          lastLoginAt: string | null
          lastName: string | null
          permissions: string[] | null
          profileImageUrl: string | null
          role: string | null
          studioId: string | null
          teamId: string | null
          updatedAt: string | null
        }
        Insert: {
          createdAt?: string | null
          departmentId?: string | null
          displayName?: string | null
          email?: string | null
          firstName?: string | null
          id: string
          isActive?: boolean | null
          lastLoginAt?: string | null
          lastName?: string | null
          permissions?: string[] | null
          profileImageUrl?: string | null
          role?: string | null
          studioId?: string | null
          teamId?: string | null
          updatedAt?: string | null
        }
        Update: {
          createdAt?: string | null
          departmentId?: string | null
          displayName?: string | null
          email?: string | null
          firstName?: string | null
          id?: string
          isActive?: boolean | null
          lastLoginAt?: string | null
          lastName?: string | null
          permissions?: string[] | null
          profileImageUrl?: string | null
          role?: string | null
          studioId?: string | null
          teamId?: string | null
          updatedAt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_departmentId_fkey"
            columns: ["departmentId"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_studioId_fkey"
            columns: ["studioId"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_teamId_fkey"
            columns: ["teamId"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      userStudioAccess: {
        Row: {
          accessLevel: string | null
          createdAt: string | null
          id: string
          studioId: string
          userId: string
        }
        Insert: {
          accessLevel?: string | null
          createdAt?: string | null
          id?: string
          studioId: string
          userId: string
        }
        Update: {
          accessLevel?: string | null
          createdAt?: string | null
          id?: string
          studioId?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "userStudioAccess_studioId_fkey"
            columns: ["studioId"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "userStudioAccess_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      workflowRules: {
        Row: {
          actions: Json
          conditions: Json
          createdAt: string | null
          description: string | null
          id: string
          isActive: boolean | null
          name: string
          runOrder: number | null
          triggerEvent: string
          updatedAt: string | null
        }
        Insert: {
          actions: Json
          conditions: Json
          createdAt?: string | null
          description?: string | null
          id?: string
          isActive?: boolean | null
          name: string
          runOrder?: number | null
          triggerEvent: string
          updatedAt?: string | null
        }
        Update: {
          actions?: Json
          conditions?: Json
          createdAt?: string | null
          description?: string | null
          id?: string
          isActive?: boolean | null
          name?: string
          runOrder?: number | null
          triggerEvent?: string
          updatedAt?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_manager: { Args: { _user_id: string }; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role: "admin" | "manager" | "staff" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "manager", "staff", "viewer"],
    },
  },
} as const
