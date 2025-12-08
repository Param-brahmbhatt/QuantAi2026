from django.conf import settings



class QuantAiRouter:
    def db_for_read(self, model, **hints):
        """
        mapped apps reads from given db
        """
        # if model._meta.app_label in settings.DATABASE_ROUTER_MAPPING.keys():
        #     return settings.DATABASE_ROUTER_MAPPING[model._meta.app_label]
        return 'default'

    def db_for_write(self, model, **hints):
        """
        Writes always go to primary.
        """
        # if model._meta.app_label in settings.DATABASE_ROUTER_MAPPING.keys():
            # return settings.DATABASE_ROUTER_MAPPING[model._meta.app_label]
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        """
        Relations between objects are allowed if both objects are
        in the primary/replica pool.
        """
        if obj1._meta.app_label in settings.DATABASE_ROUTER_MAPPING.keys():
            db1 = settings.DATABASE_ROUTER_MAPPING.get(obj1._meta.app_label)
        else:
            db1 = None
        if obj2._meta.app_label in settings.DATABASE_ROUTER_MAPPING.keys():
            db2 = settings.DATABASE_ROUTER_MAPPING.get(obj2._meta.app_label)
        else:
            db2 = None
        if db1 and db2:
            return db1 == db2
        return None

    # def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        All non-auth models end up in this pool.
        """
        # if app_label in settings.DATABASE_ROUTER_MAPPING.keys():
            # return settings.DATABASE_ROUTER_MAPPING.get(app_label) == db
        # else:
            # if db == "default":
                # return True